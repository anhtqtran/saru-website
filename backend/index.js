const express = require('express');
const app = express();
const port = 4002;

const morgan = require("morgan");
app.use(morgan("combined"));

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require("cors");
app.use(cors());

const { MongoClient, ObjectId } = require('mongodb');
const mongoURI = "mongodb+srv://user1:ry3l1jwj1IJlM1fT@database.nkts1.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Kết nối MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log("Đã kết nối MongoDB thành công!");
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error);
    process.exit(1);
  }
}
connectDB();

// Tạo tham chiếu đến collection
const database = client.db("SaruData");
const orderCollection = database.collection("orders");
const orderStatusCollection = database.collection("orderstatuses");
const paymentMethodCollection = database.collection("paymentmethods");
const paymentStatusCollection = database.collection("paymentstatuses");
const customerCollection = database.collection("customers");
const orderdetailsCollection = database.collection("orderdetails");
const productCollection = database.collection("products");

// API kiểm tra kết nối server
app.get("/", (req, res) => {
  res.send("This Web server is processed for MongoDB");
});

// API lấy danh sách đơn hàng
app.get("/orders", async (req, res) => {
  try {
    const result = await orderCollection.find({}).toArray();
    res.json(result); // Trả về JSON đúng chuẩn
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server khi lấy đơn hàng!" });
  }
});

// API lấy danh sách trạng thái đơn hàng (orderStatusID)
app.get("/order-status", async (req, res) => {
  try {
    const result = await orderStatusCollection.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error("Lỗi khi lấy trạng thái đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server khi lấy trạng thái đơn hàng!" });
  }
});

// API lấy danh sách phương thức thanh toán (paymentMethodID)
app.get("/payment-methods", async (req, res) => {
  try {
    const result = await paymentMethodCollection.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error("Lỗi khi lấy phương thức thanh toán:", error);
    res.status(500).json({ message: "Lỗi server khi lấy phương thức thanh toán!" });
  }
});

// API lấy danh sách trạng thái thanh toán (paymentStatusID)
app.get("/payment-status", async (req, res) => {
  try {
    const result = await paymentStatusCollection.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error("Lỗi khi lấy trạng thái thanh toán:", error);
    res.status(500).json({ message: "Lỗi server khi lấy trạng thái thanh toán!" });
  }
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server chạy trên cổng ${port}`);
});

// show chi tiết đơn hàng (kết hợp dữ liệu từ orders và orderdetails)
app.get("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    // Lấy thông tin đơn hàng từ collection `orders`
    const order = await orderCollection.findOne({ _id: new ObjectId(orderId) });

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    // Lấy thông tin khách hàng từ collection `customers`
    const customer = await customerCollection.findOne({ _id: new ObjectId(order.CustomerID) });
    if (customer) {
      order.CustomerName = customer.CustomerName; // Thêm tên khách hàng vào đơn hàng
    }

    // Lấy thông tin trạng thái thanh toán từ `paymentstatuses`
    const paymentStatus = await paymentStatusCollection.findOne({ _id: new ObjectId(order.PaymentStatusID) });
    order.PaymentStatus = paymentStatus ? paymentStatus.Status : "Không xác định";

    // Lấy thông tin phương thức thanh toán từ `paymentmethods`
    const paymentMethod = await paymentMethodCollection.findOne({ _id: new ObjectId(order.PaymentMethodID) });
    order.PaymentMethod = paymentMethod ? paymentMethod.Method : "Không xác định";

    // Lấy thông tin trạng thái đơn hàng từ `orderstatuses`
    const orderStatus = await orderStatusCollection.findOne({ _id: new ObjectId(order.OrderStatusID) });
    order.Status = orderStatus ? orderStatus.Status : "Không xác định";

    // Lấy thông tin chi tiết đơn hàng từ collection `orderdetails`
    const orderDetails = await orderdetailsCollection.find({ orderId: order._id }).toArray();

    // Lấy danh sách ProductID từ orderdetails
    const productIds = orderDetails.map(detail => detail.ProductId);

    // Lấy thông tin sản phẩm từ collection `products`
    const products = await productCollection.find({ _id: { $in: productIds.map(id => new ObjectId(id)) } }).toArray();

    // Ghép thông tin sản phẩm vào orderDetails
    const detailedOrderItems = orderDetails.map(detail => {
      const product = products.find(p => p._id.toString() === detail.ProductId.toString());
      return {
        ProductID: detail.ProductId,
        Quantity: detail.Quantity,
        ProductName: product ? product.name : "Không xác định",
        ProductPrice: product ? product.price : 0,
        TotalPrice: product ? product.price * detail.Quantity : 0
      };
    });

    // Kết hợp tất cả dữ liệu lại và trả về
    const orderWithDetails = {
      ...order, // Thông tin tổng quan đơn hàng
      customer: {
        CustomerID: order.CustomerID,
        CustomerName: order.CustomerName
      },
      items: detailedOrderItems // Danh sách sản phẩm chi tiết
    };

    res.json(orderWithDetails);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server khi lấy thông tin đơn hàng" });
  }
});

// Xóa đơn hàng
app.delete("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    // Xóa đơn hàng
    const result = await orderCollection.deleteOne({ _id: new ObjectId(orderId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng để xóa" });
    }

    res.json({ message: "Đơn hàng đã được xóa thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server khi xóa đơn hàng" });
  }
});

// API tạo đơn hàng mới
app.post("/orders", async (req, res) => {
  try {
    const newOrder = req.body;

    if (!newOrder || !newOrder.customer || !newOrder.products) {
      return res.status(400).json({ message: "Dữ liệu đơn hàng không hợp lệ" });
    }

    newOrder.createdAt = new Date(); // Thêm timestamp
    const result = await orderCollection.insertOne(newOrder);

    if (result.acknowledged) {
      res.status(201).json({ message: "Đơn hàng đã được tạo thành công!", OrderID: result.insertedId });
    } else {
      res.status(500).json({ message: "Không thể tạo đơn hàng" });
    }
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server khi tạo đơn hàng" });
  }
});
