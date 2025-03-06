require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const session = require('express-session');

// Middleware
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true // Cho phép gửi cookie qua CORS
}));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Kết nối MongoDB
let client, database, productCollection;
async function connectDB() {
    const uri = process.env.MONGODB_URI;
    client = new MongoClient(uri);
    await client.connect();
    database = client.db('SaruData');
    //Kết nối collection
    productCollection = database.collection('products');
    imageCollection= database.collection('images');
    categoryCollection= database.collection('productcategories');

    // Tạo index để tối ưu truy vấn
    await productCollection.createIndex({ ProductID: 1 }, { unique: true });
    await productCollection.createIndex({ ProductSKU: 1 }, { unique: true });

    console.log('Connected to MongoDB');
}
connectDB();

// ===================== PRODUCT API =====================

app.get('/api/images/:imageId', async (req, res) => {
  try {
      const image = await imageCollection.findOne({ ImageID: req.params.imageId });

      if (!image) return res.status(404).json({ error: `Image not found for ID: ${req.params.imageId}` });

      res.json({
          ImageID: image.ImageID,
          ProductImageCover: image.ProductImageCover || '',
          ProductImageSub1: image.ProductImageSub1 || '',
          ProductImageSub2: image.ProductImageSub2 || '',
          ProductImageSub3: image.ProductImageSub3 || ''
      });
  } catch (err) {
      console.error("Error fetching image:", err);
      res.status(500).json({ error: err.message });
  }
});
  



//  1. Tìm kiếm sản phẩm theo từ khóa (hỗ trợ gợi ý)
app.get('/api/products/search', async (req, res) => {
    const keyword = req.query.q;
    if (!keyword) return res.status(400).json({ error: "Keyword is required" });

    try {
        const results = await productCollection.find({
            $or: [
                { ProductName: { $regex: keyword, $options: "i" } },
                { ProductFullDescription: { $regex: keyword, $options: "i" } }
            ]
        }).limit(10).toArray();

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await database.collection('productcategories').find().toArray();
    res.json(categories); // Trả về cả CateID và CateName
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



//  2. Lọc sản phẩm theo nhiều tiêu chí
app.get('/api/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.brand) filter.ProductBrand = req.query.brand;
        if (req.query.category) filter.CateID = req.query.category;
        if (req.query.minPrice || req.query.maxPrice) {
          filter.ProductPrice = {};
          if (req.query.minPrice) filter.ProductPrice.$gte = parseInt(req.query.minPrice);
          if (req.query.maxPrice) filter.ProductPrice.$lte = parseInt(req.query.maxPrice);
        }
        if (req.query.wineVolume) filter.WineVolume = req.query.wineVolume;
        if (req.query.wineType) filter.WineType = req.query.wineType;
        if (req.query.wineIngredient) filter.WineIngredient = req.query.wineIngredient;
        if (req.query.wineFlavor) filter.WineFlavor = req.query.wineFlavor;

        const sort = req.query.sort === 'priceAsc' ? { ProductPrice: 1 } : { ProductPrice: -1 };

        const [items, total] = await Promise.all([
            productCollection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
            productCollection.countDocuments(filter)
        ]); 
      // Lấy danh sách CateID duy nhất
        const cateIDs = [...new Set(items.map(p => p.CateID))];

        // Tìm `CateName` từ collection `productcategories`
        const categories = await categoryCollection.find({ CateID: { $in: cateIDs } }).toArray();
        const cateMap = categories.reduce((acc, cur) => {
            acc[cur.CateID] = cur.CateName;
            return acc;
        }, {});

        // Gán CateName vào sản phẩm
        const productsWithCategories = items.map(p => ({
            ...p,
            CateName: cateMap[p.CateID] || 'Unknown'
        }));

        res.json({
          data: productsWithCategories,
          pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total }
      });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

//  3. Xem sản phẩm đề xuất (bán chạy & khuyến mãi)
app.get('/api/products/recommendations', async (req, res) => {
    try {
        const bestSellers = await productCollection.find({ isBestSeller: true }).limit(5).toArray();
        const promotions = await productCollection.find({ isPromotion: true }).limit(5).toArray();
        res.json({ bestSellers, promotions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  4. Xem chi tiết sản phẩm
app.get('/api/products/:id', async (req, res) => {
  try {
      const product = await productCollection.findOne({ _id: new ObjectId(req.params.id) });
      if (!product) return res.status(404).json({ error: "Product not found" });

      // Tìm ảnh từ collection `images` dựa trên `ImageID`
      const image = await database.collection('images').findOne({ ImageID: product.ImageID });

      // Gộp ảnh vào product
      const productWithImages = {
          ...product,
          ProductImageCover: image?.ProductImageCover || '',
          ProductImageSub1: image?.ProductImageSub1 || '',
          ProductImageSub2: image?.ProductImageSub2 || '',
          ProductImageSub3: image?.ProductImageSub3 || ''
      };

      res.json(productWithImages);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});


// ===================== CART API =====================

//  5. Thêm sản phẩm vào giỏ hàng (session)
app.post('/api/cart', (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId || quantity <= 0) return res.status(400).json({ error: "Invalid input" });

    req.session.cart = req.session.cart || [];
    const existingItem = req.session.cart.find(item => item.productId === productId);
    if (existingItem) existingItem.quantity += quantity;
    else req.session.cart.push({ productId, quantity });

    res.json({ message: "Added to cart", cart: req.session.cart });
});

//  6. Lấy giỏ hàng
app.get('/api/cart', (req, res) => {
    res.json(req.session.cart || []);
});

//  7. Xóa sản phẩm khỏi giỏ hàng
app.delete('/api/cart/:productId', (req, res) => {
    req.session.cart = req.session.cart.filter(item => item.productId !== req.params.productId);
    res.json({ message: "Removed from cart", cart: req.session.cart });
});

// ===================== COMPARE API =====================

//  8. Thêm sản phẩm vào danh sách so sánh
app.post('/api/compare', (req, res) => {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: "Invalid productId" });

    req.session.compareList = req.session.compareList || [];
    if (!req.session.compareList.includes(productId)) req.session.compareList.push(productId);

    res.json({ message: "Added to compare list", compareList: req.session.compareList });
});

//  9. Lấy danh sách so sánh
app.get('/api/compare', (req, res) => {
    res.json(req.session.compareList || []);
});

//  10. Xóa sản phẩm khỏi danh sách so sánh
app.delete('/api/compare/:productId', (req, res) => {
    req.session.compareList = req.session.compareList.filter(id => id !== req.params.productId);
    res.json({ message: "Removed from compare list", compareList: req.session.compareList });
});

// ===================== SERVER START =====================
app.listen(port, () => {
    console.log(` Server running on port ${port}`);
});
