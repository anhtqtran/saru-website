const express = require('express');
const app = express();
const port = 3003;

const morgan=require("morgan") 
app.use(morgan("combined"))

const bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true}));

const cors = require('cors');
app.use(cors());

app.listen(port, () => {
  console.log(`Saru Server listening on port ${port}`);
});

// API kiểm tra kết nối
app.get("/", (req, res) => {
  res.send("Saru Server is processed for MongoDB");
});


// Kết nối MongoDB
const { MongoClient, ObjectId } = require('mongodb'); 
client = new MongoClient("mongodb://127.0.0.1:27017"); 
client.connect();
database = client.db("SaruData"); 
// Kết nối tới các collection
productCollection = database.collection("productData");

// 1. Function của Product Page
// Lấy toàn bộ sản phẩm
app.get("/product", cors(), async (req, res) => {
  const { category, minPrice, maxPrice, wineType, brand, wineVolume, netContent, isBestSeller, isOnSale } = req.query;

  let query = {};
  if (category) query.productCategory = category;
  if (minPrice || maxPrice) {
    query.productPrice = {};
    if (minPrice) query.productPrice.$gte = parseInt(minPrice);
    if (maxPrice) query.productPrice.$lte = parseInt(maxPrice);
  }
  if (wineType) query.wineType = wineType;
  if (brand) query.productBrand = brand;
  if (wineVolume) query.wineVolume = wineVolume;
  if (netContent) query.productNetContent = netContent;
  if (isBestSeller) query.productRating = { $gte: 4.0 }; // Ví dụ sản phẩm bán chạy có rating cao
  if (isOnSale) query.productDiscountPercentage = { $gt: 0 }; // Sản phẩm khuyến mãi có giảm giá

  const result = await productCollection.find(query).toArray();
  res.send(result);
});

// Lấy chi tiết một sản phẩm theo productID
app.get("/product/:id", cors(), async (req, res) => {
  const productId = req.params.id;
  const result = await productCollection.findOne({ productID: productId });
  if (result) {
    res.send(result);
  } else {
    res.status(404).send({ message: "Product not found" });
  }
});