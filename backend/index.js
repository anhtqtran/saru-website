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
const mongoURI = "mongodb+srv://user1:ry3l1jwj1IJlM1fT@database.nkts1.mongodb.net/?";
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

app.get("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    // Kiểm tra và log ID nhận được
    console.log('Order ID nhận từ request:', orderId);

    // Kiểm tra định dạng ID
    if (!ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: `ID đơn hàng không hợp lệ. Phải là chuỗi hex 24 ký tự. Nhận được: ${orderId}`,
      });
    }

    // Chuyển đổi sang ObjectId
    const objectId = new ObjectId(orderId);

    // Lấy thông tin đơn hàng từ collection `orders`
    const order = await orderCollection.findOne({ _id: objectId });

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    // Log dữ liệu đơn hàng để kiểm tra
    console.log('Dữ liệu đơn hàng:', order);

    // Lấy thông tin khách hàng từ collection `customers`
    const customer = await customerCollection.findOne({ CustomerID: order.CustomerID });
    order.CustomerName = customer ? customer.CustomerName : "Không xác định";

    // Lấy thông tin trạng thái thanh toán từ `paymentstatuses`
    const paymentStatus = await paymentStatusCollection.findOne({ PaymentStatusID: order.PaymentStatusID });
    order.PaymentStatus = paymentStatus ? paymentStatus.PaymentStatus : "Không xác định";

    // Lấy thông tin phương thức thanh toán từ `paymentmethods`
    const paymentMethod = await paymentMethodCollection.findOne({ PaymentMethodID: order.PaymentMethodID });
    order.PaymentMethod = paymentMethod ? paymentMethod.PaymentMethod : "Không xác định";

    // Lấy thông tin trạng thái đơn hàng từ `orderstatuses`
    const orderStatus = await orderStatusCollection.findOne({ OrderStatusID: order.OrderStatusID });
    order.Status = orderStatus ? orderStatus.Status : "Không xác định";

    // Lấy thông tin chi tiết đơn hàng từ collection `orderdetails`
    const orderDetails = await orderdetailsCollection.find({ orderId: objectId }).toArray();
    console.log('Dữ liệu orderDetails:', orderDetails);

    // Lấy danh sách ProductID từ orderdetails
    const productIds = [];
    const detailedOrderItems = orderDetails.map((detail) => {
      // Kiểm tra ProductId trước khi chuyển đổi
      if (!detail.ProductId || typeof detail.ProductId !== 'string') {
        console.warn(`ProductId không hợp lệ trong orderdetails: ${detail.ProductId}`);
        return {
          ProductID: detail.ProductId || 'Không xác định',
          Quantity: detail.Quantity || 0,
          ProductName: "Không xác định",
          ProductPrice: 0,
          TotalPrice: 0,
        };
      }

      if (ObjectId.isValid(detail.ProductId)) {
        productIds.push(new ObjectId(detail.ProductId));
      } else {
        console.warn(`ProductId không hợp lệ trong orderdetails: ${detail.ProductId}`);
      }

      return {
        ProductID: detail.ProductId,
        Quantity: detail.Quantity || 0,
      };
    });

    // Lấy thông tin sản phẩm từ collection `products`
    let products = [];
    if (productIds.length > 0) {
      products = await productCollection
        .find({ _id: { $in: productIds } })
        .toArray();
    }

    // Ghép thông tin sản phẩm vào orderDetails
    detailedOrderItems.forEach((item) => {
      const product = products.find((p) => p._id.toString() === item.ProductID.toString());
      if (product) {
        item.ProductName = product.name || "Không xác định";
        item.ProductPrice = product.price || 0;
        item.TotalPrice = (product.price || 0) * item.Quantity;
      } else {
        item.ProductName = "Không xác định";
        item.ProductPrice = 0;
        item.TotalPrice = 0;
      }
    });

    // Kết hợp tất cả dữ liệu lại và trả về
    const orderWithDetails = {
      _id: order._id.toString(),
      OrderID: order.OrderID,
      OrderDate: order.OrderDate,
      CustomerID: order.CustomerID,
      CustomerName: order.CustomerName,
      OrderStatusID: order.OrderStatusID,
      Status: order.Status,
      PaymentStatusID: order.PaymentStatusID,
      PaymentStatus: order.PaymentStatus,
      PaymentMethodID: order.PaymentMethodID,
      PaymentMethod: order.PaymentMethod,
      items: detailedOrderItems,
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
// Cập nhật đơn hàng
app.put("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const updatedOrder = req.body;

  // Cập nhật đơn hàng trong collection `orders`
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

// API gộp dữ liệu liên quan đến đơn hàng
app.get("/combined-data", cors(), async (req, res) => {
  try {
    // Lấy dữ liệu từ các collection
    const orders = await orderCollection.find({}).toArray();
    const orderStatuses = await orderStatusCollection.find({}).toArray();
    const paymentMethods = await paymentMethodCollection.find({}).toArray();
    const paymentStatuses = await paymentStatusCollection.find({}).toArray();
    const customers = await customerCollection.find({}).toArray();

    // Log dữ liệu để debug
    console.log('Dữ liệu paymentMethods:', paymentMethods);
    console.log('Dữ liệu paymentStatuses:', paymentStatuses);

    // Gộp thông tin trạng thái, phương thức thanh toán, trạng thái thanh toán và khách hàng vào đơn hàng
    const combinedOrders = orders.map(order => {
      // Tìm thông tin trạng thái đơn hàng
      const orderStatus = orderStatuses.find(status => status.OrderStatusID === order.OrderStatusID);
      const orderStatusText = orderStatus ? orderStatus.Status : "Không xác định";

      // Tìm thông tin phương thức thanh toán
      const paymentMethod = paymentMethods.find(method => method.PaymentMethodID === order.PaymentMethodID);
      const paymentMethodText = paymentMethod ? paymentMethod.PaymentMethod : "Không xác định";

      // Tìm thông tin trạng thái thanh toán
      const paymentStatus = paymentStatuses.find(status => status.PaymentStatusID === order.PaymentStatusID);
      const paymentStatusText = paymentStatus ? paymentStatus.PaymentStatus : "Không xác định";

      // Tìm thông tin khách hàng
      const customer = customers.find(cust => cust.CustomerID === order.CustomerID);
      const customerName = customer ? customer.CustomerName : "Không xác định";

      // Log để kiểm tra từng đơn hàng
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

    // Sắp xếp đơn hàng theo ngày đặt hàng (mới nhất trước)
    combinedOrders.sort((a, b) => {
      const dateA = new Date(a.OrderDate).getTime();
      const dateB = new Date(b.OrderDate).getTime();
      return dateB - dateA;
    });

    // Tạo đối tượng dữ liệu gộp
    const combinedData = {
      orders: combinedOrders,
      orderStatuses,
      paymentMethods,
      paymentStatuses,
      customers,
      total: {
        orders: combinedOrders.length,
      },
    };

    res.status(200).json(combinedData);
  } catch (error) {
    console.error("❌ Lỗi khi xử lý /combined-data:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});
