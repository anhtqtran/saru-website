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
const client = new MongoClient("mongodb+srv://user1:ry3l1jwj1IJlM1fT@database.nkts1.mongodb.net/");

// Kết nối MongoDB
client.connect()
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Error connecting to MongoDB:", err));

// Tạo tham chiếu đến collection
const database = client.db("SaruData");
const orderCollection = database.collection("orders");
const orderStatusCollection = database.collection("orderstatuses");
const paymentMethodCollection = database.collection("paymentmethods");
const paymentStatusCollection = database.collection("paymentstatuses");
const customerCollection = database.collection("customers");
const orderdetailsCollection = database.collection("orderdetails");
const productCollection = database.collection("products");
const imagesCollection = database.collection("images");

// API kiểm tra kết nối server
app.get("/", (req, res) => {
  res.send("This Web server is processed for MongoDB");
});

// API lấy danh sách đơn hàng
app.get("/orders", async (req, res) => {
  try {
    const result = await orderCollection.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server khi lấy đơn hàng!" });
  }
});

// API lấy chi tiết đơn hàng
app.get("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    console.log('Order ID nhận từ request:', orderId);

    if (!ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: `ID đơn hàng không hợp lệ. Phải là chuỗi hex 24 ký tự. Nhận được: ${orderId}`,
      });
    }

    const objectId = new ObjectId(orderId);

    const order = await orderCollection.findOne({ _id: objectId });

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    console.log('Dữ liệu đơn hàng:', order);

    // Lấy thông tin khách hàng
    const customer = await customerCollection.findOne({ CustomerID: order.CustomerID });
    order.CustomerName = customer ? customer.CustomerName : "Không xác định";
    order.CustomerAdd = customer ? customer.CustomerAdd : { address: '', city: '', state: '' };
    order.CustomerPhone = customer ? customer.CustomerPhone : "";

    // Lấy thông tin trạng thái thanh toán
    const paymentStatus = await paymentStatusCollection.findOne({ PaymentStatusID: order.PaymentStatusID });
    order.PaymentStatus = paymentStatus ? paymentStatus.PaymentStatus : "Không xác định";

    // Lấy thông tin phương thức thanh toán
    const paymentMethod = await paymentMethodCollection.findOne({ PaymentMethodID: order.PaymentMethodID });
    order.PaymentMethod = paymentMethod ? paymentMethod.PaymentMethod : "Không xác định";

    // Lấy thông tin trạng thái đơn hàng
    const orderStatus = await orderStatusCollection.findOne({ OrderStatusID: order.OrderStatusID });
    order.Status = orderStatus ? orderStatus.Status : "Không xác định";

    // Lấy chi tiết đơn hàng từ orderdetailsCollection (dùng OrderID dưới dạng string)
    const orderDetails = await orderdetailsCollection.find({ OrderID: order.OrderID }).toArray();
    console.log('Dữ liệu orderDetails:', orderDetails);

    // Nếu không có orderDetails, trả về mảng items rỗng
    if (orderDetails.length === 0) {
      console.log("Không tìm thấy chi tiết đơn hàng cho OrderID:", order.OrderID);
      return res.json({
        ...order,
        items: [],
        TotalOrderAmount: 0
      });
    }

    // Lấy danh sách ProductID từ orderDetails
    const productIds = orderDetails.map(detail => detail.ProductID);
    console.log('ProductIDs từ orderDetails:', productIds);

    // Lấy thông tin sản phẩm từ productCollection
    const products = await productCollection.find({ ProductID: { $in: productIds } }).toArray();
    console.log('Dữ liệu products:', products);

    // Lấy danh sách ImageID từ products
    const imageIds = products.map(product => product.ImageID).filter(id => id);
    const images = await imagesCollection.find({ ImageID: { $in: imageIds } }).toArray();
    console.log('Dữ liệu images:', images);

    // Tạo mảng items chi tiết
    const detailedOrderItems = orderDetails.map((detail) => {
      const product = products.find(p => p.ProductID === detail.ProductID);
      const image = images.find(i => i.ImageID === product?.ImageID);
      return {
        ProductID: detail.ProductID,
        Quantity: detail.Quantity || 0,
        ProductName: product ? product.ProductName : "Không xác định",
        ProductCategory: "Không xác định", // Cần thêm logic nếu có categories
        ProductImageCover: image ? image.ProductImageCover : "",
        Price: product ? parseFloat(product.WinePrice) || 0 : 0,
        TotalPrice: product ? (parseFloat(product.WinePrice) || 0) * (detail.Quantity || 0) : 0,
      };
    });

    // Tính tổng tiền đơn hàng
    const TotalOrderAmount = detailedOrderItems.reduce((sum, item) => sum + (item.TotalPrice || 0), 0);

    // Trả về kết quả
    const orderWithDetails = {
      _id: order._id.toString(),
      OrderID: order.OrderID,
      OrderDate: order.OrderDate,
      CustomerID: order.CustomerID,
      CustomerName: order.CustomerName,
      CustomerAdd: order.CustomerAdd,
      CustomerPhone: order.CustomerPhone,
      OrderStatusID: order.OrderStatusID,
      Status: order.Status,
      PaymentStatusID: order.PaymentStatusID,
      PaymentStatus: order.PaymentStatus,
      PaymentMethodID: order.PaymentMethodID,
      PaymentMethod: order.PaymentMethod,
      items: detailedOrderItems,
      TotalOrderAmount: TotalOrderAmount,
    };

    res.json(orderWithDetails);
  } catch (error) {
    console.error("Lỗi chi tiết khi lấy thông tin đơn hàng:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy thông tin đơn hàng",
      error: error.message,
    });
  }
});

// Các endpoint khác giữ nguyên
app.get("/customers", async (req, res) => {
  try {
    const customers = await customerCollection.find().toArray();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách khách hàng", error: error.message });
  }
});

app.get("/order-status", async (req, res) => {
  try {
    const orderStatuses = await orderStatusCollection.find().toArray();
    res.json(orderStatuses);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy trạng thái đơn hàng", error: error.message });
  }
});

app.get("/payment-methods", async (req, res) => {
  try {
    const paymentMethods = await paymentMethodCollection.find().toArray();
    res.json(paymentMethods);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy phương thức thanh toán", error: error.message });
  }
});

app.get("/payment-status", async (req, res) => {
  try {
    const paymentStatuses = await paymentStatusCollection.find().toArray();
    res.json(paymentStatuses);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy trạng thái thanh toán", error: error.message });
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await productCollection.find().toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm", error: error.message });
  }
});

// Xóa đơn hàng
app.delete("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
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
    if (!newOrder || !newOrder.CustomerID || !newOrder.OrderID) {
      return res.status(400).json({ message: "Dữ liệu đơn hàng không hợp lệ" });
    }
    newOrder.createdAt = new Date();
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

// Cập nhật đơn hàng
app.put("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const updatedOrder = req.body;
    const result = await orderCollection.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: updatedOrder }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng để cập nhật" });
    }
    res.json({ message: "Cập nhật đơn hàng thành công!" });
  } catch (error) {
    console.error("Lỗi khi cập nhật đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật đơn hàng" });
  }
});

// API gộp dữ liệu
app.get("/combined-data", cors(), async (req, res) => {
  try {
    const orders = await orderCollection.find({}).toArray();
    const orderStatuses = await orderStatusCollection.find({}).toArray();
    const paymentMethods = await paymentMethodCollection.find({}).toArray();
    const paymentStatuses = await paymentStatusCollection.find({}).toArray();
    const customers = await customerCollection.find({}).toArray();

    console.log('Dữ liệu paymentMethods:', paymentMethods);
    console.log('Dữ liệu paymentStatuses:', paymentStatuses);

    const combinedOrders = orders.map(order => {
      const orderStatus = orderStatuses.find(status => status.OrderStatusID === order.OrderStatusID);
      const orderStatusText = orderStatus ? orderStatus.Status : "Không xác định";

      const paymentMethod = paymentMethods.find(method => method.PaymentMethodID === order.PaymentMethodID);
      const paymentMethodText = paymentMethod ? paymentMethod.PaymentMethod : "Không xác định";

      const paymentStatus = paymentStatuses.find(status => status.PaymentStatusID === order.PaymentStatusID);
      const paymentStatusText = paymentStatus ? paymentStatus.PaymentStatus : "Không xác định";

      const customer = customers.find(cust => cust.CustomerID === order.CustomerID);
      const customerName = customer ? customer.CustomerName : "Không xác định";

      console.log(`Đơn hàng ${order.OrderID}:`, {
        PaymentMethodID: order.PaymentMethodID,
        PaymentMethodText: paymentMethodText,
        PaymentStatusID: order.PaymentStatusID,
        PaymentStatusText: paymentStatusText
      });

      return {
        ...order,
        OrderStatusText: orderStatusText,
        PaymentMethodText: paymentMethodText,
        PaymentStatusText: paymentStatusText,
        CustomerName: customerName,
      };
    });

    combinedOrders.sort((a, b) => new Date(b.OrderDate) - new Date(a.OrderDate));

    const combinedData = {
      orders: combinedOrders,
      orderStatuses,
      paymentMethods,
      paymentStatuses,
      customers,
      total: { orders: combinedOrders.length },
    };

    res.status(200).json(combinedData);
  } catch (error) {
    console.error("❌ Lỗi khi xử lý /combined-data:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});