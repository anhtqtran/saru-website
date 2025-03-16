require('dotenv').config();
const express = require('express');
const port = 4000;
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

const app = express();

// Cấu hình Winston Logger
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});
app.use(cors({
  origin: '*',  // Cho phép mọi origin truy cập (hoặc thay '*' bằng danh sách origin cụ thể)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Phần comment về Redis từ mã gốc của bạn
// const { RedisStore } = require('connect-redis');
// const redis = require('redis');
// const redisClient = redis.createClient({
//     host: '172.24.81.243',
//     port: 6379
// });
// redisClient.on('error', (err) => {
//   logger.error('Redis Client Error', { error: err.message });
// });
// redisClient.connect().catch(err => {
//   logger.error('Failed to connect to Redis', { error: err.message });
// });

// Cấu hình express-session với maxAge từ biến môi trường
const sessionMaxAge = parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000; // Mặc định 24 giờ
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: sessionMaxAge
  }
}));

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json({ limit: '50mb' }));  // Giới hạn JSON lên 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Cho phép dữ liệu form lớn

const multer = require('multer');

// Cấu hình Multer
const storage = multer.memoryStorage(); // Lưu ảnh vào bộ nhớ trước khi xử lý
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // Giới hạn 5MB

app.use(cors({
  origin: ['http://localhost:4001', 'http://localhost:4002', 'http://localhost:4200'],
  credentials: true
}));

// Middleware để gán correlationId cho mỗi request
app.use((req, res, next) => {
  req.correlationId = uuidv4();
  next();
});

// Cấu hình morgan
morgan.token('correlationId', (req) => req.correlationId);
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - correlationId: :correlationId', {
  stream: { write: message => logger.info(message.trim()) }
}));

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút.',
  headers: true
});

// Kết nối MongoDB
let client, database, productCollection, imageCollection, categoryCollection, reviewCollection, orderDetailCollection, accountCollection, customerCollection,
    orderCollection, orderStatusCollection, paymentMethodCollection, paymentStatusCollection, voucherCollection, voucherConditionCollection;
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  client = new MongoClient(uri);
  try {
    await client.connect();
    database = client.db('SaruData');
    productCollection = database.collection('products');
    imageCollection = database.collection('images');
    categoryCollection = database.collection('productcategories');
    reviewCollection = database.collection('reviews');
    orderDetailCollection = database.collection('orderdetails');
    accountCollection = database.collection('accounts');
    customerCollection = database.collection('customers');
    orderCollection = database.collection('orders'); 
    orderStatusCollection = database.collection('orderstatuses'); 
    paymentMethodCollection = database.collection('paymentmethods'); 
    paymentStatusCollection = database.collection('paymentstatuses')
    voucherCollection = database.collection('Vouchers'); 
    voucherConditionCollection = database.collection('VoucherConditions');
    productCategoryCollection = database.collection ('productcategories');
    promotionsCollection = database.collection("promotions");
    promotionStatusesCollection = database.collection("promotionstatuses");
    promotionScopeCollection = database.collection ("promotionscopes")

    await productCollection.createIndex({ ProductID: 1 }, { unique: true });
    await accountCollection.createIndex({ CustomerEmail: 1 }, { unique: true });
    await productCollection.createIndex({ CateID: 1 });
    await reviewCollection.createIndex({ ProductID: 1, DatePosted: -1 });

    logger.info('Connected to MongoDB', { correlationId: 'system' });
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { error: error.message, correlationId: 'system' });
    process.exit(1);
  }
}
connectDB();

// Middleware kiểm tra đăng nhập
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.isAuthenticated = false;
    logger.debug('No token provided', { path: req.path, correlationId: req.correlationId });
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.account = decoded;
    req.isAuthenticated = true;
    next();
  } catch (err) {
    logger.warn('Invalid token', { error: err.message, path: req.path, correlationId: req.correlationId });
    res.status(403).json({ message: 'Token không hợp lệ.' });
  }
}

// Toàn bộ code từ file gốc (giữ nguyên, bao gồm cả comment)
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
    logger.error("Error fetching image:", { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/search', async (req, res) => {
  const keyword = req.query.q;
  if (!keyword) return res.status(400).json({ error: "Keyword is required" });

  try {
    const suggestions = await productCollection.find({
      ProductName: { $regex: keyword, $options: "i" }
    }).limit(5).project({ ProductName: 1, _id: 0 }).toArray();
    
    res.json(suggestions.map(s => s.ProductName));
  } catch (err) {
    console.error('❌ Lỗi API /api/products/search:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await database.collection('productcategories').find().toArray();
    res.json(categories);
  } catch (err) {
    logger.error('Error in GET /api/categories', { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 100));
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
    if (req.query.bestSellers === 'true') filter.isBestSeller = true;
    if (req.query.onSale === 'true') filter.isPromotion = true;

    

    const sortOptions = {
      'priceAsc': { ProductPrice: 1 },
      'priceDesc': { ProductPrice: -1 }
    };
    const sort = sortOptions[req.query.sort] || { ProductPrice: -1 };

    const [items, total] = await Promise.all([
      productCollection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      productCollection.countDocuments(filter)
    ]);

    const cateIDs = [...new Set(items.map(p => p.CateID))];
    const categories = await categoryCollection.find({ CateID: { $in: cateIDs } }).toArray();
    const cateMap = categories.reduce((acc, cur) => {
      acc[cur.CateID] = cur.CateName;
      return acc;
    }, {});

    const productsWithCategories = items.map(p => ({
      ...p,
      CateName: cateMap[p.CateID] || 'Unknown'
    }));
    res.json({
      data: productsWithCategories,
      pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total }
    });
  } catch (err) {
    logger.error('Error in GET /api/products', { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/filters', async (req, res) => {
  try {
    const categories = await categoryCollection.find().toArray();
    const brands = await productCollection.distinct('ProductBrand');
    const wineVolumes = await productCollection.distinct('WineVolume');
    const wineTypes = await productCollection.distinct('WineType');
    res.json({ categories, brands, wineVolumes, wineTypes });
  } catch (err) {
    logger.error('Error in GET /api/filters', { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/recommendations', async (req, res) => {
  try {
    const bestSellers = await productCollection.find({ isBestSeller: true }).limit(5).toArray();
    const promotions = await productCollection.find({ isPromotion: true }).limit(5).toArray();
    res.json({ bestSellers, promotions });
  } catch (err) {
    logger.error('Error in GET /api/products/recommendations', { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ error: err.message });
  }
});

// app.get('/api/products/:id', async (req, res) => {
//   try {
//     const product = await productCollection.findOne({ _id: new ObjectId(req.params.id) });
//     if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại." });

//     const image = await imageCollection.findOne({ ImageID: product.ImageID });
//     const productWithImages = {
//       ...product,
//       ProductImageCover: image?.ProductImageCover || '',
//       ProductImageSub1: image?.ProductImageSub1 || '',
//       ProductImageSub2: image?.ProductImageSub2 || '',
//       ProductImageSub3: image?.ProductImageSub3 || ''
//     };

//     const reviewsAgg = await reviewCollection.aggregate([
//       { $match: { ProductID: product.ProductID } },
//       { $sort: { DatePosted: -1 } },
//       {
//         $project: {
//           _id: 0,
//           CustomerID: 1,
//           Rating: { $min: [{ $max: ["$Rating", 0] }, 5] },
//           Content: 1,
//           DatePosted: { $dateToString: { format: "%d/%m/%Y", date: "$DatePosted" } }
//         }
//       }
//     ]).toArray();

//     const validReviews = reviewsAgg.filter(r => r.Rating > 0);
//     const averageRating = validReviews.length > 0
//       ? Number((validReviews.reduce((sum, r) => sum + r.Rating, 0) / validReviews.length).toFixed(1))
//       : 0;

//     const relatedProducts = await productCollection.find({
//       CateID: product.CateID,
//       _id: { $ne: new ObjectId(req.params.id) }
//     })
//       .limit(4)
//       .project({ ProductName: 1, ProductPrice: 1, ProductImageCover: 1, _id: 1 })
//       .toArray();

//     const relatedProductsWithStringId = relatedProducts.map(p => ({
//       ...p,
//       _id: p._id.toHexString()
//     }));

//     res.json({
//       ...productWithImages,
//       reviews: reviewsAgg,
//       averageRating,
//       totalReviewCount: validReviews.length,
//       relatedProducts: relatedProductsWithStringId
//     });
//   } catch (err) {
//     logger.error('Error fetching product detail', { error: err.message, correlationId: req.correlationId });
//     res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau.' });
//   }
// });

// ===================== COMPARE API =====================
app.post('/api/compare', authenticateToken, async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "Invalid productId" });

  try {
    if (req.isAuthenticated) {
      const AccountID = req.account.AccountID;
      const compareCollection = database.collection('compares');
      let compare = await compareCollection.findOne({ AccountID });

      if (!compare) {
        compare = { AccountID, items: [productId] };
        await compareCollection.insertOne(compare);
      } else if (!compare.items.includes(productId)) {
        await compareCollection.updateOne(
          { AccountID },
          { $push: { items: productId } }
        );
      }
      const updatedCompare = await compareCollection.findOne({ AccountID });
      logger.info('Added to compare list in MongoDB', { AccountID, compareList: updatedCompare.items, correlationId: req.correlationId });
      res.json({ message: "Added to compare list", compareList: updatedCompare.items });
    } else {
      req.session.compareList = req.session.compareList || [];
      if (!req.session.compareList.includes(productId)) {
        req.session.compareList.push(productId);
      }
      logger.info('Added to compare list in session', { sessionId: req.sessionID, compareList: req.session.compareList, correlationId: req.correlationId });
      res.json({ message: "Added to compare list", compareList: req.session.compareList });
    }
  } catch (err) {
    logger.error('Error in POST /api/compare', { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/compare', authenticateToken, async (req, res) => {
  try {
    if (req.isAuthenticated) {
      const AccountID = req.account.AccountID;
      const compareCollection = database.collection('compares');
      let compare = await compareCollection.findOne({ AccountID });

      if (!compare && req.session.compareList?.length > 0) {
        await compareCollection.insertOne({ AccountID, items: req.session.compareList });
        compare = await compareCollection.findOne({ AccountID });
        req.session.compareList = [];
        logger.info('Synchronized compare list from session to MongoDB', { AccountID, correlationId: req.correlationId });
      }

      logger.info('Fetched compare list from MongoDB', { AccountID, compareList: compare ? compare.items : [], correlationId: req.correlationId });
      res.json(compare ? compare.items : []);
    } else {
      const compareList = req.session.compareList || [];
      logger.info('Fetched compare list from session', { sessionId: req.sessionID, compareList, correlationId: req.correlationId });
      res.json(compareList);
    }
  } catch (err) {
    logger.error('Error in GET /api/compare', { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ message: 'Lỗi hệ thống khi lấy danh sách so sánh.', error: err.message });
  }
});

app.delete('/api/compare/all', authenticateToken, async (req, res) => {
  try {
    if (req.isAuthenticated) {
      const AccountID = req.account.AccountID;
      const compareCollection = database.collection('compares');
      await compareCollection.deleteOne({ AccountID });
      logger.info('Cleared compare list in MongoDB', { AccountID, correlationId: req.correlationId });
      res.json({ message: "Cleared all compare items", compareList: [] });
    } else {
      req.session.compareList = [];
      req.session.save((err) => {
        if (err) {
          logger.error('Error saving session in DELETE /api/compare/all', { error: err.message, correlationId: req.correlationId });
          return res.status(500).json({ error: err.message });
        }
        logger.info('Cleared compare list in session', { sessionId: req.sessionID, correlationId: req.correlationId });
        res.json({ message: "Cleared all compare items", compareList: req.session.compareList });
      });
    }
  } catch (err) {
    logger.error('Error in DELETE /api/compare/all', { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/compare/:productId', authenticateToken, async (req, res) => {
  const productId = req.params.productId;

  try {
    if (req.isAuthenticated) {
      const AccountID = req.account.AccountID;
      const compareCollection = database.collection('compares');
      await compareCollection.updateOne(
        { AccountID },
        { $pull: { items: productId } }
      );
      const updatedCompare = await compareCollection.findOne({ AccountID });
      logger.info('Removed from compare list in MongoDB', { AccountID, compareList: updatedCompare ? updatedCompare.items : [], correlationId: req.correlationId });
      res.json({ message: "Removed from compare list", compareList: updatedCompare ? updatedCompare.items : [] });
    } else {
      req.session.compareList = (req.session.compareList || []).filter(id => id !== productId);
      req.session.save((err) => {
        if (err) {
          logger.error('Error saving session in DELETE /api/compare/:productId', { error: err.message, correlationId: req.correlationId });
          return res.status(500).json({ error: err.message });
        }
        logger.info('Removed from compare list in session', { sessionId: req.sessionID, compareList: req.session.compareList, correlationId: req.correlationId });
        res.json({ message: "Removed from compare list", compareList: req.session.compareList });
      });
    }
  } catch (err) {
    logger.error('Error in DELETE /api/compare/:productId', { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ error: err.message });
  }
});

// ===================== CART API =====================
app.post('/api/cart', authenticateToken, async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || quantity <= 0) return res.status(400).json({ error: "Invalid input" });

  try {
    if (req.isAuthenticated) {
      const AccountID = req.account.AccountID;
      const cartCollection = database.collection('carts');
      let cart = await cartCollection.findOne({ AccountID });

      if (!cart) {
        cart = { AccountID, items: [{ productId, quantity }] };
        await cartCollection.insertOne(cart);
      } else {
        const existingItem = cart.items.find(item => item.productId === productId);
        if (existingItem) {
          await cartCollection.updateOne(
            { AccountID, "items.productId": productId },
            { $inc: { "items.$.quantity": quantity } }
          );
        } else {
          await cartCollection.updateOne(
            { AccountID },
            { $push: { items: { productId, quantity } } }
          );
        }
      }
      const updatedCart = await cartCollection.findOne({ AccountID });
      logger.info('Added to cart in MongoDB', { AccountID, cart: updatedCart.items, correlationId: req.correlationId });
      res.json({ message: "Added to cart", cart: updatedCart.items });
    } else {
      req.session.cart = req.session.cart || [];
      const existingItem = req.session.cart.find(item => item.productId === productId);
      if (existingItem) existingItem.quantity += quantity;
      else req.session.cart.push({ productId, quantity });
      logger.info('Added to cart in session', { sessionId: req.sessionID, cart: req.session.cart, correlationId: req.correlationId });
      res.json({ message: "Added to cart", cart: req.session.cart });
    }
  } catch (err) {
    logger.error('Error in POST /api/cart', { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    if (req.isAuthenticated) {
      const AccountID = req.account.AccountID;
      const cartCollection = database.collection('carts');
      let cart = await cartCollection.findOne({ AccountID });

      if (!cart && req.session.cart?.length > 0) {
        await cartCollection.insertOne({ AccountID, items: req.session.cart });
        cart = await cartCollection.findOne({ AccountID });
        req.session.cart = [];
        logger.info('Synchronized cart from session to MongoDB', { AccountID, correlationId: req.correlationId });
      }

      logger.info('Fetched cart from MongoDB', { AccountID, cart: cart ? cart.items : [], correlationId: req.correlationId });
      res.json(cart ? cart.items : []);
    } else {
      const cart = req.session.cart || [];
      logger.info('Fetched cart from session', { sessionId: req.sessionID, cart, correlationId: req.correlationId });
      res.json(cart);
    }
  } catch (err) {
    logger.error('Error in GET /api/cart', { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ message: 'Lỗi hệ thống khi lấy giỏ hàng.', error: err.message });
  }
});

app.delete('/api/cart/:productId', authenticateToken, async (req, res) => {
  const productId = req.params.productId;

  try {
    if (req.isAuthenticated) {
      const AccountID = req.account.AccountID;
      const cartCollection = database.collection('carts');
      await cartCollection.updateOne(
        { AccountID },
        { $pull: { items: { productId } } }
      );
      const updatedCart = await cartCollection.findOne({ AccountID });
      logger.info('Removed from cart in MongoDB', { AccountID, cart: updatedCart ? updatedCart.items : [], correlationId: req.correlationId });
      res.json({ message: "Removed from cart", cart: updatedCart ? updatedCart.items : [] });
    } else {
      req.session.cart = (req.session.cart || []).filter(item => item.productId !== productId);
      logger.info('Removed from cart in session', { sessionId: req.sessionID, cart: req.session.cart, correlationId: req.correlationId });
      res.json({ message: "Removed from cart", cart: req.session.cart });
    }
  } catch (err) {
    logger.error('Error in DELETE /api/cart/:productId', { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ error: err.message });
  }
});

// ===================== LOGIN, SIGNUP, RESETPASS =====================
const cron = require('node-cron');

cron.schedule('0 * * * *', async () => {
  await accountCollection.deleteMany({
    otpExpiry: { $lt: new Date() }
  });
  logger.info('Cleaned up expired OTPs', { correlationId: 'system' });
});

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

(async () => {
  try {
    await transporter.verify();
    logger.info("Kết nối Nodemailer thành công!", { correlationId: 'system' });
  } catch (error) {
    logger.error('Lỗi cấu hình Nodemailer', { error: error.message, code: error.code, correlationId: 'system' });
  }
})();

app.post('/api/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  logger.debug('Received login request', { body: req.body, correlationId: req.correlationId });
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed in /api/login', { errors: errors.array(), correlationId: req.correlationId });
    return res.status(400).json({ message: 'Dữ liệu đầu vào không hợp lệ.', errors: errors.array() });
  }

  const { email, password } = req.body;
  logger.debug('Login attempt', { email, correlationId: req.correlationId });

  try {
    const account = await accountCollection.findOne({ CustomerEmail: email });
    if (!account) {
      logger.warn('Login attempt with non-existent email', { email, correlationId: req.correlationId });
      return res.status(401).json({ message: 'Email không tồn tại.' });
    }

    const isMatch = await bcrypt.compare(password, account.CustomerPassword);
    if (!isMatch) {
      logger.warn('Incorrect password attempt', { email, correlationId: req.correlationId });
      return res.status(401).json({ message: 'Mật khẩu không đúng.' });
    }

    const token = jwt.sign({ AccountID: account.AccountID }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Đồng bộ session với MongoDB
    try {
      const cartCollection = database.collection('carts');
      const compareCollection = database.collection('compares');

      if (req.session.cart?.length > 0) {
        await cartCollection.updateOne(
          { AccountID: account.AccountID },
          { $set: { items: req.session.cart } },
          { upsert: true }
        );
        req.session.cart = [];
        logger.info('Cart session data synchronized to MongoDB', { AccountID: account.AccountID, correlationId: req.correlationId });
      }

      if (req.session.compareList?.length > 0) {
        await compareCollection.updateOne(
          { AccountID: account.AccountID },
          { $set: { items: req.session.compareList } },
          { upsert: true }
        );
        req.session.compareList = [];
        logger.info('Compare list session data synchronized to MongoDB', { AccountID: account.AccountID, correlationId: req.correlationId });
      }
    } catch (syncError) {
      logger.error('Error synchronizing session data to MongoDB during login', {
        error: syncError.message,
        correlationId: req.correlationId,
        email
      });
    }

    logger.info('User logged in successfully', { email, customerId: account.CustomerID, correlationId: req.correlationId });
    res.status(200).json({
      message: 'Đăng nhập thành công!',
      token,
      account: {
        _id: account._id.toString(),
        AccountID: account.AccountID,
        CustomerID: account.CustomerID,
        CustomerEmail: account.CustomerEmail
      }
    });
  } catch (error) {
    logger.error('Error in /api/login', { error: error.message, email, correlationId: req.correlationId });
    res.status(500).json({ message: 'Đăng nhập thất bại, vui lòng kiểm tra thông tin.' });
  }
});

app.post('/api/register', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('receiveEmail').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed in /api/register', { errors: errors.array(), correlationId: req.correlationId });
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, receiveEmail } = req.body;

  try {
    const existingAccount = await accountCollection.findOne({ CustomerEmail: email });
    if (existingAccount) {
      logger.warn('Email already registered', { email, correlationId: req.correlationId });
      return res.status(400).json({ message: 'Email đã được đăng ký.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const timestamp = Date.now();
    const newAccount = {
      AccountID: `acc_${timestamp}`,
      CustomerID: `cus_${timestamp}`,
      CustomerEmail: email,
      CustomerPassword: hashedPassword
    };
    await accountCollection.insertOne(newAccount);

    const newCustomer = {
      CustomerID: newAccount.CustomerID,
      CustomerName: '',
      MemberID: '',
      CustomerAdd: '',
      CustomerPhone: '',
      CustomerBirth: '',
      CustomerAvatar: '',
      ReceiveEmail: receiveEmail || false
    };
    await customerCollection.insertOne(newCustomer);

    const token = jwt.sign({ AccountID: newAccount.AccountID }, process.env.JWT_SECRET, { expiresIn: '1h' });
    logger.info('User registered successfully', { email, accountId: newAccount.AccountID, correlationId: req.correlationId });
    res.status(201).json({ message: 'Đăng ký thành công!', token });
  } catch (error) {
    logger.error('Error in /api/register', { error: error.message, email, correlationId: req.correlationId });
    res.status(500).json({ message: 'Đăng ký thất bại.', error: error.message });
  }
});

app.post('/api/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  const { email } = req.body;

  try {
    const account = await accountCollection.findOne({ CustomerEmail: email });
    if (!account) {
      logger.warn('Forgot password attempt with non-existent email', { email, correlationId: req.correlationId });
      return res.status(404).json({ message: 'Email không tồn tại.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await accountCollection.updateOne(
      { CustomerEmail: email },
      { $set: { otp, otpExpiry } }
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mã xác thực đặt lại mật khẩu',
      text: `Mã xác thực của bạn là: ${otp}. Hiệu lực trong 10 phút.`
    };

    await transporter.sendMail(mailOptions);
    logger.info('OTP sent successfully', { email, otp, correlationId: req.correlationId });
    res.status(200).json({ message: 'Mã xác thực đã được gửi đến email của bạn.' });
  } catch (error) {
    logger.error('Error in /api/forgot-password', { error: error.message, code: error.code, correlationId: req.correlationId });
    res.status(500).json({ message: 'Gửi mã xác thực thất bại.', error: error.message });
  }
});

app.post('/api/verify-otp', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res) => {
  const { email, otp } = req.body;

  try {
    const account = await accountCollection.findOne({ CustomerEmail: email });
    if (!account || !account.otp || account.otp !== otp || new Date() > account.otpExpiry) {
      logger.warn('Invalid or expired OTP', { email, otp, correlationId: req.correlationId });
      return res.status(400).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn.' });
    }

    await accountCollection.updateOne(
      { CustomerEmail: email },
      { $unset: { otp: "", otpExpiry: "" } }
    );

    logger.info('OTP verified successfully', { email, correlationId: req.correlationId });
    res.status(200).json({ message: 'Xác minh OTP thành công.', email });
  } catch (error) {
    logger.error('Error in /api/verify-otp', { error: error.message, email, correlationId: req.correlationId });
    res.status(500).json({ message: 'Xác minh OTP thất bại.', error: error.message });
  }
});

app.post('/api/reset-password', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('newPassword').isLength({ min: 8 })
], async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await accountCollection.updateOne(
      { CustomerEmail: email },
      { $set: { CustomerPassword: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      logger.warn('Reset password attempt with non-existent email', { email, correlationId: req.correlationId });
      return res.status(404).json({ message: 'Email không tồn tại.' });
    }

    logger.info('Password reset successfully', { email, correlationId: req.correlationId });
    res.status(200).json({ message: 'Mật khẩu đã được cập nhật thành công.' });
  } catch (error) {
    logger.error('Error in /api/reset-password', { error: error.message, email, correlationId: req.correlationId });
    res.status(500).json({ message: 'Đặt lại mật khẩu thất bại.', error: error.message });
  }
});

app.post('/api/logout', authenticateToken, (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        logger.error('Error destroying session in /api/logout', { error: err.message, correlationId: req.correlationId });
        return res.status(500).json({ message: 'Đăng xuất thất bại.' });
      }
      logger.info('Session destroyed', { correlationId: req.correlationId });
      res.json({ message: "Đăng xuất thành công." });
    });
  } else {
    logger.info('Token-based logout, no session to destroy', { correlationId: req.correlationId });
    res.json({ message: "Đăng xuất thành công." });
  }
});

app.get('/api/verify-token', authenticateToken, (req, res) => {
  res.json({ message: 'Token hợp lệ', account: req.account });
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { ReviewID, ProductID, CustomerID, Content, Rating, DatePosted, Images } = req.body;

    if (!ProductID || !CustomerID || !Rating || !Content) {
      return res.status(400).json({ error: "Thiếu thông tin đánh giá!" });
    }

    const newReview = {
      ReviewID,
      ProductID,
      CustomerID,
      Content,
      Rating: Math.min(Math.max(Rating, 1), 5), // Đảm bảo rating nằm trong khoảng 1-5
      DatePosted: new Date(DatePosted).toISOString(),
      Images: Images || []
    };

    await reviewCollection.insertOne(newReview);
    res.json({ message: "Đánh giá đã được lưu thành công!", review: newReview });
  } catch (err) {
    console.error("Lỗi khi lưu đánh giá:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await reviewCollection.find().sort({ DatePosted: -1 }).toArray();
    res.json(reviews);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách đánh giá:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!productId) {
      return res.status(400).json({ error: "Thiếu ID sản phẩm!" });
    }

    const reviews = await reviewCollection.find({ ProductID: productId })
      .sort({ DatePosted: -1 })
      .toArray();

    res.json(reviews);
  } catch (err) {
    console.error("Lỗi khi lấy đánh giá của sản phẩm:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { ReviewID, ProductID, CustomerID, Content, Rating, DatePosted, Images } = req.body;

    if (!ProductID || !CustomerID || !Rating || !Content) {
      return res.status(400).json({ error: "Thiếu thông tin đánh giá!" });
    }

    const newReview = {
      ReviewID: `review_${new Date().getTime()}`,
      ProductID,
      CustomerID,
      Content,
      Rating: Math.min(Math.max(Rating, 1), 5),
      DatePosted: new Date().toISOString(),
      Images: Images || []
    };

    await reviewCollection.insertOne(newReview);
    res.json({ message: "Đánh giá đã được lưu thành công!", review: newReview });
  } catch (err) {
    console.error("Lỗi khi lưu đánh giá:", err);
    res.status(500).json({ error: err.message });
  }
});

// app.get('/api/productstocks', async (req, res) => {
//   try {
//     const stocks = await database.collection('productstocks').find().toArray();
//     res.json(stocks);
//   } catch (err) {
//     console.error("❌ Lỗi khi lấy dữ liệu tồn kho:", err);
//     res.status(500).json({ error: 'Lỗi server!' });
//   }
// });

app.get('/api/productstocks', async (req, res) => {
  try {
    const stocks = await database.collection('productstocks').aggregate([
      {
        $lookup: {
          from: "products",
          localField: "ProductID",
          foreignField: "ProductID",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          _id: 1,
          ProductID: 1,
          StockQuantity: 1,
          ProductName: "$productInfo.ProductName",
          ProductSKU: "$productInfo.ProductSKU"
        }
      }
    ]).toArray();

    res.json(stocks);
  } catch (err) {
    console.error("❌ Lỗi khi lấy dữ liệu tồn kho:", err);
    res.status(500).json({ error: 'Lỗi server!' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    console.log("📢 API `/api/products` đã được gọi!");

    const productsWithImages = await database.collection('products').aggregate([
      {
        $lookup: {
          from: 'images',
          localField: 'ImageID',
          foreignField: 'ImageID',
          as: 'imageData'
        }
      },
      {
        $unwind: {
          path: '$imageData',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          ProductID: 1,
          ProductName: 1,
          ProductSKU: 1,
          CateID: 1,
          CateName: 1,
          ProductBrand: 1,
          ImageID: 1,
          ProductImageCover: {
            $ifNull: ['$imageData.ProductImageCover', '']
          }
        }
      },
      { $limit: 100 }
    ]).toArray();

    if (!productsWithImages.length) {
      console.log('⚠️ Không tìm thấy dữ liệu');
    }

    console.log("📢 Dữ liệu trả về:", JSON.stringify(productsWithImages, null, 2));
    res.json({ data: productsWithImages });
  } catch (err) {
    console.error('❌ Lỗi chi tiết:', err.stack);
    res.status(500).json({
      error: 'Lỗi server!',
      details: err.message
    });
  }
});

// app.delete('/api/products?limit=100', (req, res) => {
//   const productId = req.params.id;
//   // Code xử lý xóa sản phẩm ở đây
//   res.json({ message: `Đã xóa sản phẩm ${productId}` });
// });

app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ." });
    }

    const result = await productCollection.deleteOne({ _id: new ObjectId(productId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });
    }

    res.json({ message: `Đã xóa sản phẩm với _id ${productId}` });
  } catch (err) {
    console.error("❌ Lỗi khi xóa sản phẩm:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products-with-stock', async (req, res) => {
  try {
    const products = await database.collection('products').find({}).toArray();
    const stocks = await database.collection('productstocks').find({}).toArray();

    const stockMap = stocks.reduce((acc, stock) => {
      acc[stock.ProductID] = stock.StockQuantity;
      return acc;
    }, {});

    const productsWithStock = products.map(product => ({
      ...product,
      StockQuantity: stockMap[product.ProductID] || 0
    }));

    res.json({ data: productsWithStock });
  } catch (err) {
    console.error('Lỗi trong API /api/products-with-stock:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products-full-details', async (req, res) => {
  try {
    const productsWithDetails = await database.collection('products').aggregate([
      {
        $lookup: {
          from: "productstocks",
          localField: "ProductID",
          foreignField: "ProductID",
          as: "stockData"
        }
      },
      {
        $unwind: {
          path: "$stockData",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "images",
          localField: "ImageID",
          foreignField: "ImageID",
          as: "imageData"
        }
      },
      {
        $unwind: {
          path: "$imageData",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "productcategories",
          localField: "CateID",
          foreignField: "CateID",
          as: "categoryData"
        }
      },
      {
        $unwind: {
          path: "$categoryData",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          ProductID: 1,
          ProductName: 1,
          ProductPrice: 1,
          ProductBrand: 1,
          StockQuantity: { $ifNull: ["$stockData.StockQuantity", 0] },
          ProductImageCover: { $ifNull: ["$imageData.ProductImageCover", ""] },
          ProductImageSub1: { $ifNull: ["$imageData.ProductImageSub1", ""] },
          ProductImageSub2: { $ifNull: ["$imageData.ProductImageSub2", ""] },
          ProductImageSub3: { $ifNull: ["$imageData.ProductImageSub3", ""] },
          CateID: 1,
          CateName: { $ifNull: ["$categoryData.CateName", "Chưa phân loại"] }
        }
      }
    ]).toArray();

    res.json({ data: productsWithDetails });
  } catch (err) {
    console.error('❌ Lỗi trong API /api/products-full-details:', err);
    res.status(500).json({ error: err.message });
  }
});

// app.post('/api/products', async (req, res) => {
//   try {
//     const { ProductID, ImageID, CateID, ProductName, ProductPrice, ProductBrand, 
//             ProductFullDescription, ProductShortDescription, ProductSKU, ProductImages, StockQuantity } = req.body;

//     const existingImage = await imageCollection.findOne({ ImageID });
//     if (!existingImage) {
//       const imageData = {
//         ImageID,
//         ProductImageCover: ProductImages[0] || "",
//         ProductImageSub1: ProductImages[1] || "",
//         ProductImageSub2: ProductImages[2] || "",
//         ProductImageSub3: ProductImages[3] || "",
//       };
//       await imageCollection.insertOne(imageData);
//     }

//     const newProduct = {
//       ProductID,
//       ImageID,
//       CateID,
//       ProductName,
//       ProductPrice: Number(ProductPrice) || 0,
//       ProductBrand,
//       ProductFullDescription,
//       ProductShortDescription,
//       ProductSKU,
//       CreatedAt: new Date()
//     };

//     await productCollection.insertOne(newProduct);

//     await database.collection('productstocks').updateOne(
//       { ProductID },
//       { $set: { StockQuantity: Number(StockQuantity) || 0 } },
//       { upsert: true }
//     );

//     res.json({ message: "Sản phẩm đã được thêm!", product: newProduct });
//   } catch (err) {
//     console.error("❌ Lỗi khi thêm sản phẩm:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const imageUrl = `https://your-cloud.com/${req.file.filename}`;

    res.json({ message: "Upload thành công!", url: imageUrl });
  } catch (err) {
    console.error("❌ Lỗi upload ảnh:", err);
    res.status(500).json({ error: err.message });
  }
});

// app.put('/api/products/:id', async (req, res) => {
//   try {
//     const productId = req.params.id;
//     const updatedData = req.body;

//     const result = await productCollection.updateOne(
//       { ProductID: productId },
//       { $set: updatedData }
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ message: "Sản phẩm không tồn tại." });
//     }

//     res.json({ message: `Sản phẩm ${productId} đã được cập nhật!` });
//   } catch (err) {
//     console.error("❌ Lỗi khi cập nhật sản phẩm:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// app.put('/api/products/:id', async (req, res) => {
//   try {
//     const productId = req.params.id;
//     const updatedData = req.body;

//     delete updatedData._id;
//     delete updatedData.ProductID;

//     let query = { _id: new ObjectId(productId) };
//     const result = await productCollection.updateOne(query, { $set: updatedData });

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ message: "Sản phẩm không tồn tại." });
//     }

//     if (updatedData.StockQuantity !== undefined) {
//       await database.collection('productstocks').updateOne(
//         { ProductID: updatedData.ProductID || req.body.ProductID },
//         { $set: { StockQuantity: Number(updatedData.StockQuantity) || 0 } },
//         { upsert: true }
//       );
//     }

//     res.json({ message: `Sản phẩm ${productId} đã được cập nhật!` });
//   } catch (err) {
//     console.error("❌ Lỗi khi cập nhật sản phẩm:", err);
//     res.status(500).json({ error: err.message, stack: err.stack });
//   }
// });

app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ." });
    }

    const product = await productCollection.findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });
    }

    const image = await imageCollection.findOne({ ImageID: product.ImageID });
    const stock = await database.collection('productstocks').findOne({ ProductID: product.ProductID });

    const productWithDetails = {
      _id: product._id.toString(),
      ProductID: product.ProductID,
      CateID: product.CateID,
      ProductName: product.ProductName || "",
      ProductPrice: product.ProductPrice || 0,
      ProductBrand: product.ProductBrand || "",
      ProductShortDescription: product.ProductShortDescription || "",
      ProductFullDescription: product.ProductFullDescription || "",
      ProductSKU: product.ProductSKU || "",
      StockQuantity: stock ? stock.StockQuantity || 0 : 0,
      IsPromotion: product.IsPromotion || false,
      AllowOutOfStock: product.AllowOutOfStock || false,
      WineType: product.WineType || "",
      WineVolume: product.WineVolume || "",
      ComparePrice: product.ComparePrice || 0,
      ProductImageCover: image?.ProductImageCover || "",
      ProductImageSub1: image?.ProductImageSub1 || "",
      ProductImageSub2: image?.ProductImageSub2 || "",
      ProductImageSub3: image?.ProductImageSub3 || ""
    };

    res.json(productWithDetails);
  } catch (err) {
    console.error('Error fetching product detail:', err);
    res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await productCollection.find().toArray();
    const productsWithDetails = await Promise.all(products.map(async (product) => {
      const image = await imageCollection.findOne({ ImageID: product.ImageID });
      const stock = await database.collection('productstocks').findOne({ ProductID: product.ProductID });

      return {
        _id: product._id.toString(),
        ProductID: product.ProductID,
        CateID: product.CateID,
        ProductName: product.ProductName || "",
        ProductPrice: product.ProductPrice || 0,
        ProductBrand: product.ProductBrand || "",
        ProductShortDescription: product.ProductShortDescription || "",
        ProductFullDescription: product.ProductFullDescription || "",
        ProductSKU: product.ProductSKU || "",
        StockQuantity: stock ? stock.StockQuantity || 0 : 0,
        IsPromotion: product.IsPromotion || false,
        AllowOutOfStock: product.AllowOutOfStock || false,
        WineType: product.WineType || "",
        WineVolume: product.WineVolume || "",
        ComparePrice: product.ComparePrice || 0,
        ProductImageCover: image?.ProductImageCover || "",
        ProductImageSub1: image?.ProductImageSub1 || "",
        ProductImageSub2: image?.ProductImageSub2 || "",
        ProductImageSub3: image?.ProductImageSub3 || ""
      };
    }));

    res.json(productsWithDetails);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = req.body;

    const existingProduct = await productCollection.findOne({ ProductID: newProduct.ProductID });
    if (existingProduct) {
      return res.status(400).json({ message: "Sản phẩm với ProductID này đã tồn tại." });
    }

    const result = await productCollection.insertOne(newProduct);

    if (newProduct.ProductImages && newProduct.ProductImages.length > 0) {
      await imageCollection.insertOne({
        ImageID: newProduct.ImageID,
        ProductImageCover: newProduct.ProductImages[0] || "",
        ProductImageSub1: newProduct.ProductImages[1] || "",
        ProductImageSub2: newProduct.ProductImages[2] || "",
        ProductImageSub3: newProduct.ProductImages[3] || ""
      });
    }

    await database.collection('productstocks').insertOne({
      ProductID: newProduct.ProductID,
      StockQuantity: Number(newProduct.StockQuantity) || 0
    });

    res.status(201).json({ message: "Sản phẩm đã được thêm thành công!", productId: result.insertedId });
  } catch (err) {
    console.error("❌ Lỗi khi thêm sản phẩm:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedData = req.body;

    delete updatedData._id;

    const result = await productCollection.updateOne(
      { _id: new ObjectId(productId) },
      { $set: {
        ProductID: updatedData.ProductID,
        CateID: updatedData.CateID,
        ProductName: updatedData.ProductName,
        ProductPrice: Number(updatedData.ProductPrice) || 0,
        ProductBrand: updatedData.ProductBrand,
        ProductShortDescription: updatedData.ProductShortDescription,
        ProductFullDescription: updatedData.ProductFullDescription,
        ProductSKU: updatedData.ProductSKU,
        StockQuantity: Number(updatedData.StockQuantity) || 0,
        IsPromotion: updatedData.IsPromotion,
        AllowOutOfStock: updatedData.AllowOutOfStock,
        WineType: updatedData.WineType,
        WineVolume: updatedData.WineVolume,
        ComparePrice: Number(updatedData.ComparePrice) || 0
      }}
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });
    }

    if (updatedData.ProductImages && updatedData.ProductImages.length > 0) {
      await imageCollection.updateOne(
        { ImageID: updatedData.ImageID },
        { $set: {
          ProductImageCover: updatedData.ProductImages[0] || "",
          ProductImageSub1: updatedData.ProductImages[1] || "",
          ProductImageSub2: updatedData.ProductImages[2] || "",
          ProductImageSub3: updatedData.ProductImages[3] || ""
        }},
        { upsert: true }
      );
    }

    await database.collection('productstocks').updateOne(
      { ProductID: updatedData.ProductID },
      { $set: { StockQuantity: Number(updatedData.StockQuantity) || 0 } },
      { upsert: true }
    );

    res.json({ message: `Sản phẩm ${productId} đã được cập nhật!` });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// API kiểm tra kết nối server
app.get("/", (req, res) => {
  res.send("This Web server is processed for MongoDB");
});

// API lấy danh sách đơn hàng
app.get("/orders", async (req, res) => {
  try {
    const result = await orderCollection.find({}).toArray();

    const ordersWithDetails = await Promise.all(result.map(async (order) => {
      const customer = await customerCollection.findOne({ CustomerID: order.CustomerID });
      const paymentStatus = await paymentStatusCollection.findOne({ PaymentStatusID: order.PaymentStatusID });
      const paymentMethod = await paymentMethodCollection.findOne({ PaymentMethodID: order.PaymentMethodID });
      const orderStatus = await orderStatusCollection.findOne({ OrderStatusID: order.OrderStatusID });

      const orderDetails = await orderDetailCollection.find({ OrderID: order.OrderID }).toArray();
      const productIds = orderDetails.map(detail => detail.ProductID);
      const products = await productCollection.find({ ProductID: { $in: productIds } }).toArray();
      const imageIds = products.map(product => product.ImageID).filter(id => id);
      const images = await imageCollection.find({ ImageID: { $in: imageIds } }).toArray();
      const cateIds = products.map(product => product.CateID).filter(id => id);
      const categories = await productCategoryCollection.find({ CateID: { $in: cateIds } }).toArray();

      const detailedOrderItems = orderDetails.map((detail) => {
        const product = products.find(p => p.ProductID === detail.ProductID);
        const image = images.find(i => i.ImageID === product?.ImageID);
        const category = categories.find(c => c.CateID === product?.CateID);
        const price = product && product.ProductPrice ? parseFloat(product.ProductPrice) : 0;
        const quantity = detail.Quantity || 0;
        return {
          ProductID: detail.ProductID,
          Quantity: quantity,
          ProductName: product ? product.ProductName : "Không xác định",
          ProductCategory: {
            CateName: category ? category.CateName : "Không xác định",
            CateDescription: category ? category.CateDescription : "Không có mô tả",
          },
          ProductImageCover: image ? image.ProductImageCover : "",
          Price: price,
          TotalPrice: price * quantity,
        };
      });

      const TotalOrderAmount = detailedOrderItems.reduce((sum, item) => sum + (item.TotalPrice || 0), 0);

      return {
        _id: order._id.toString(),
        OrderID: order.OrderID,
        OrderDate: order.OrderDate,
        CustomerID: order.CustomerID,
        CustomerName: customer ? customer.CustomerName : "Không xác định",
        CustomerAdd: customer ? customer.CustomerAdd : { address: '', city: '', state: '' },
        CustomerPhone: customer ? customer.CustomerPhone : "",
        OrderStatusID: order.OrderStatusID,
        OrderStatusText: orderStatus ? orderStatus.Status : "Không xác định",
        PaymentStatusID: order.PaymentStatusID,
        PaymentStatusText: paymentStatus ? paymentStatus.PaymentStatus : "Không xác định",
        PaymentMethodID: order.PaymentMethodID,
        PaymentMethodText: paymentMethod ? paymentMethod.PaymentMethod : "Không xác định",
        items: detailedOrderItems,
        TotalOrderAmount: TotalOrderAmount,
      };
    }));

    res.json(ordersWithDetails);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server khi lấy đơn hàng!", error: error.message });
  }
});

// API lấy chi tiết đơn hàng
app.get("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    console.log('Order ID nhận từ request:', orderId, ' (Kiểu:', typeof orderId, ')');

    let order;
    if (ObjectId.isValid(orderId)) {
      order = await orderCollection.findOne({ _id: new ObjectId(orderId) });
      console.log('Kết quả tìm kiếm bằng ObjectId:', orderId, ' - Tìm thấy:', !!order);
    }
    if (!order) {
      order = await orderCollection.findOne({ OrderID: orderId }); // Thêm tìm kiếm bằng OrderID
      console.log('Kết quả tìm kiếm bằng OrderID:', orderId, ' - Tìm thấy:', !!order);
    }

    if (!order) {
      console.log(`Không tìm thấy đơn hàng với ID: ${orderId}`);
      return res.status(404).json({ message: `Đơn hàng với ID ${orderId} không tồn tại` });
    }

    const customer = await customerCollection.findOne({ CustomerID: order.CustomerID });
    console.log('Thông tin khách hàng cho CustomerID:', order.CustomerID, 'Dữ liệu:', customer);

    const paymentStatus = await paymentStatusCollection.findOne({ PaymentStatusID: order.PaymentStatusID });
    const paymentMethod = await paymentMethodCollection.findOne({ PaymentMethodID: order.PaymentMethodID });
    const orderStatus = await orderStatusCollection.findOne({ OrderStatusID: order.OrderStatusID });

    const orderDetails = await orderDetailCollection.find({ OrderID: order.OrderID }).toArray();
    console.log('Dữ liệu orderDetails:', orderDetails);

    if (orderDetails.length === 0) {
      console.log("Không tìm thấy chi tiết đơn hàng cho OrderID:", order.OrderID);
      return res.json({
        ...order,
        _id: order._id.toString(),
        CustomerName: customer ? customer.CustomerName : "Không xác định",
        CustomerAdd: customer && customer.CustomerAdd ? customer.CustomerAdd : { address: '', city: '', state: '' },
        CustomerPhone: customer ? customer.CustomerPhone : "",
        OrderStatusText: orderStatus ? orderStatus.Status : "Không xác định",
        PaymentStatusText: paymentStatus ? paymentStatus.PaymentStatus : "Không xác định",
        PaymentMethodText: paymentMethod ? paymentMethod.PaymentMethod : "Không xác định",
        items: [],
        TotalOrderAmount: 0,
        VoucherID: order.VoucherID || null,
        VoucherDetails: null,
        VoucherDiscount: 0
      });
    }

    // Lấy thông tin voucher nếu có VoucherID
    let voucherDetails = null;
    let voucherDiscount = 0;
    if (order.VoucherID) {
      voucherDetails = await voucherCollection.findOne({ VoucherID: order.VoucherID });
      if (voucherDetails) {
        console.log('Thông tin voucher tìm thấy:', voucherDetails);
        if (new Date(voucherDetails.VoucherExpiredDate) > new Date() && voucherDetails.VoucherQuantity > 0) {
          const subtotal = await orderDetails.reduce(async (sumPromise, detail) => {
              const sum = await sumPromise;
              const product = await productCollection.findOne({ ProductID: detail.ProductID });
              const price = product && product.ProductPrice ? parseFloat(product.ProductPrice) : 0;
              return sum + (price * (detail.Quantity || 0));
          }, Promise.resolve(0));
          voucherDiscount = (subtotal * voucherDetails.VoucherValue) / 100 || 0;
          console.log('Voucher áp dụng thành công, Discount:', voucherDiscount);
        } else {
          console.log('Voucher không hợp lệ (hết hạn hoặc hết số lượng)');
        }
      } else {
        console.log(`Không tìm thấy voucher với ID: ${order.VoucherID}`);
      }
    }

    const productIds = orderDetails.map(detail => detail.ProductID);
    const products = await productCollection.find({ ProductID: { $in: productIds } }).toArray();
    const imageIds = products.map(product => product.ImageID).filter(id => id);
    const images = await imageCollection.find({ ImageID: { $in: imageIds } }).toArray();
    const cateIds = products.map(product => product.CateID).filter(id => id);
    const categories = await productCategoryCollection.find({ CateID: { $in: cateIds } }).toArray();

    const detailedOrderItems = orderDetails.map((detail) => {
      const product = products.find(p => p.ProductID === detail.ProductID);
      const image = images.find(i => i.ImageID === product?.ImageID);
      const category = categories.find(c => c.CateID === product?.CateID);
      const price = product && product.ProductPrice ? parseFloat(product.ProductPrice) : 0;
      const quantity = detail.Quantity || 0;
      return {
        ProductID: detail.ProductID,
        Quantity: quantity,
        ProductName: product ? product.ProductName : "Không xác định",
        ProductCategory: {
          CateName: category ? category.CateName : "Không xác định",
          CateDescription: category ? category.CateDescription : "Không có mô tả",
        },
        ProductImageCover: image ? image.ProductImageCover : "",
        Price: price,
        TotalPrice: price * quantity,
      };
    });

    const TotalOrderAmount = detailedOrderItems.reduce((sum, item) => sum + (item.TotalPrice || 0), 0) - voucherDiscount;

    const orderWithDetails = {
      _id: order._id.toString(),
      OrderID: order.OrderID,
      OrderDate: order.OrderDate,
      CustomerID: order.CustomerID,
      CustomerName: customer ? customer.CustomerName : "Không xác định",
      CustomerAdd: customer && customer.CustomerAdd ? customer.CustomerAdd : { address: '', city: '', state: '' },
      CustomerPhone: customer ? customer.CustomerPhone : "",
      OrderStatusID: order.OrderStatusID,
      OrderStatusText: orderStatus ? orderStatus.Status : "Không xác định",
      PaymentStatusID: order.PaymentStatusID,
      PaymentStatusText: paymentStatus ? paymentStatus.PaymentStatus : "Không xác định",
      PaymentMethodID: order.PaymentMethodID,
      PaymentMethodText: paymentMethod ? paymentMethod.PaymentMethod : "Không xác định",
      VoucherID: order.VoucherID || null,
      VoucherDetails: voucherDetails ? {
        VoucherID: voucherDetails.VoucherID,
        VoucherValue: voucherDetails.VoucherValue,
        VoucherExpiredDate: voucherDetails.VoucherExpiredDate,
        VoucherQuantity: voucherDetails.VoucherQuantity
      } : null,
      VoucherDiscount: voucherDiscount,
      items: detailedOrderItems,
      TotalOrderAmount: TotalOrderAmount
    };

    res.json(orderWithDetails);
  } catch (error) {
    console.error("Lỗi chi tiết khi lấy thông tin đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server khi lấy thông tin đơn hàng", error: error.message });
  }
});

// API cập nhật đơn hàng
app.put('/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const updatedData = req.body;

    console.log('Cập nhật đơn hàng với ID:', orderId, 'Data:', updatedData);

    // Kiểm tra dữ liệu đầu vào
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({ message: 'Dữ liệu cập nhật không được để trống' });
    }

    // Kiểm tra PaymentStatusID nếu có
    if (updatedData.PaymentStatusID !== undefined) {
      const paymentStatusExists = await paymentStatusCollection.findOne({ PaymentStatusID: updatedData.PaymentStatusID });
      if (!paymentStatusExists) {
        return res.status(400).json({ message: `PaymentStatusID ${updatedData.PaymentStatusID} không hợp lệ. Chỉ chấp nhận 0 hoặc 1.` });
      }
    }

    let result;
    if (ObjectId.isValid(orderId)) {
      const objectId = new ObjectId(orderId);
      result = await orderCollection.findOneAndUpdate(
        { _id: objectId },
        { $set: updatedData },
        { returnDocument: 'after' }
      );
    } else {
      // Nếu orderId không phải ObjectId hợp lệ, thử tìm bằng chuỗi thô
      result = await orderCollection.findOneAndUpdate(
        { _id: orderId },
        { $set: updatedData },
        { returnDocument: 'after' }
      );
    }

    if (!result || !result.value) {
      console.log(`Không tìm thấy đơn hàng để cập nhật với ID: ${orderId}`);
      return res.status(404).json({ message: `Đơn hàng với ID ${orderId} không tồn tại` });
    }

    const updatedOrder = result.value;
    const customer = await customerCollection.findOne({ CustomerID: updatedOrder.CustomerID });
    const paymentStatus = await paymentStatusCollection.findOne({ PaymentStatusID: updatedOrder.PaymentStatusID });
    const paymentMethod = await paymentMethodCollection.findOne({ PaymentMethodID: updatedOrder.PaymentMethodID });
    const orderStatus = await orderStatusCollection.findOne({ OrderStatusID: updatedOrder.OrderStatusID });

    const orderDetails = await orderDetailCollection.find({ OrderID: updatedOrder.OrderID }).toArray();
    const productIds = orderDetails.map(detail => detail.ProductID);
    const products = await productCollection.find({ ProductID: { $in: productIds } }).toArray();
    const imageIds = products.map(product => product.ImageID).filter(id => id);
    const images = await imageCollection.find({ ImageID: { $in: imageIds } }).toArray();
    const cateIds = products.map(product => product.CateID).filter(id => id);
    const categories = await productCategoryCollection.find({ CateID: { $in: cateIds } }).toArray();

    const detailedOrderItems = orderDetails.map((detail) => {
      const product = products.find(p => p.ProductID === detail.ProductID);
      const image = images.find(i => i.ImageID === product?.ImageID);
      const category = categories.find(c => c.CateID === product?.CateID);
      const price = product && product.ProductPrice ? parseFloat(product.ProductPrice) : 0;
      const quantity = detail.Quantity || 0;
      return {
        ProductID: detail.ProductID,
        Quantity: quantity,
        ProductName: product ? product.ProductName : "Không xác định",
        ProductCategory: {
          CateName: category ? category.CateName : "Không xác định",
          CateDescription: category ? category.CateDescription : "Không có mô tả",
        },
        ProductImageCover: image ? image.ProductImageCover : "",
        Price: price,
        TotalPrice: price * quantity,
      };
    });

    const TotalOrderAmount = detailedOrderItems.reduce((sum, item) => sum + (item.TotalPrice || 0), 0);

    const orderWithDetails = {
      _id: updatedOrder._id.toString(),
      OrderID: updatedOrder.OrderID,
      OrderDate: updatedOrder.OrderDate,
      CustomerID: updatedOrder.CustomerID,
      CustomerName: customer ? customer.CustomerName : "Không xác định",
      CustomerAdd: customer ? customer.CustomerAdd : { address: '', city: '', state: '' },
      CustomerPhone: customer ? customer.CustomerPhone : "",
      OrderStatusID: updatedOrder.OrderStatusID,
      OrderStatusText: updatedData.OrderStatusText || (orderStatus ? orderStatus.Status : "Không xác định"),
      PaymentStatusID: updatedOrder.PaymentStatusID,
      PaymentStatusText: updatedData.PaymentStatusText || (paymentStatus ? paymentStatus.PaymentStatus : "Không xác định"),
      PaymentMethodID: updatedOrder.PaymentMethodID,
      PaymentMethodText: paymentMethod ? paymentMethod.PaymentMethod : "Không xác định",
      items: detailedOrderItems,
      TotalOrderAmount: TotalOrderAmount,
    };

    res.json(orderWithDetails);
  } catch (error) {
    console.error('Lỗi khi cập nhật đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật đơn hàng', error: error.message });
  }
});

// API xóa đơn hàng
app.delete('/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;

    console.log('Xóa đơn hàng với ID:', orderId);

    let result;
    if (ObjectId.isValid(orderId)) {
      const objectId = new ObjectId(orderId);
      result = await orderCollection.findOneAndDelete({ _id: objectId });
    } else {
      result = await orderCollection.findOneAndDelete({ _id: orderId });
    }

    if (!result.value) {
      console.log(`Không tìm thấy đơn hàng với ID: ${orderId}`);
      return res.status(404).json({ message: `Đơn hàng với ID ${orderId} không tồn tại` });
    }

    res.status(200).json({ message: `Xóa đơn hàng ${orderId} thành công` });
  } catch (error) {
    console.error('Lỗi khi xóa đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa đơn hàng', error: error.message });
  }
});

// Customer
app.get("/customers", async (req, res) => {
  try {
    const customers = await customerCollection.find().toArray();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách khách hàng", error: error.message });
  }
});

app.get("/customers/:id", async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await customerCollection.findOne({ CustomerID: customerId });

    if (!customer) {
      return res.status(404).json({ message: `Không tìm thấy khách hàng với ID: ${customerId}` });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin khách hàng", error: error.message });
  }
});

app.put('/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const updatedData = req.body;

    console.log('Cập nhật đơn hàng với ID:', orderId, 'Data:', updatedData);

    if (updatedData.VoucherID) {
      const voucher = await voucherCollection.findOne({ VoucherID: updatedData.VoucherID });
      if (voucher && new Date(voucher.VoucherExpiredDate) > new Date() && voucher.VoucherQuantity > 0) {
        const subtotal = (updatedData.items || []).reduce((sum, item) => sum + (item.TotalPrice || 0), 0);
        updatedData.VoucherDiscount = (subtotal * voucher.VoucherValue) / 100 || 0;
      } else {
        updatedData.VoucherDiscount = 0;
      }
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({ message: 'Dữ liệu cập nhật không được để trống' });
    }

    if (updatedData.PaymentStatusID !== undefined) {
      const paymentStatusExists = await paymentStatusCollection.findOne({ PaymentStatusID: updatedData.PaymentStatusID });
      if (!paymentStatusExists) {
        return res.status(400).json({ message: `PaymentStatusID ${updatedData.PaymentStatusID} không hợp lệ. Chỉ chấp nhận 0 hoặc 1.` });
      }
    }

    let result;
    if (ObjectId.isValid(orderId)) {
      result = await orderCollection.findOneAndUpdate(
        { _id: new ObjectId(orderId) },
        { $set: updatedData },
        { returnDocument: 'after' }
      );
    } else {
      result = await orderCollection.findOneAndUpdate(
        { OrderID: orderId }, // Thêm tìm kiếm bằng OrderID
        { $set: updatedData },
        { returnDocument: 'after' }
      );
    }

    if (!result || !result.value) {
      console.log(`Không tìm thấy đơn hàng để cập nhật với ID: ${orderId}`);
      return res.status(404).json({ message: `Đơn hàng với ID ${orderId} không tồn tại` });
    }

    // ... (phần còn lại giữ nguyên)
  } catch (error) {
    console.error('Lỗi khi cập nhật đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật đơn hàng', error: error.message });
  }
});


// Trạng thái order
app.get("/order-status", async (req, res) => {
  try {
    const orderStatuses = await orderStatusCollection.find().toArray();
    res.json(orderStatuses);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy trạng thái đơn hàng", error: error.message });
  }
});

// Phương thức thanh toán
app.get("/payment-methods", async (req, res) => {
  try {
    const paymentMethods = await paymentMethodCollection.find().toArray();
    res.json(paymentMethods);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy phương thức thanh toán", error: error.message });
  }
});

// Trạng thái thanh toán
app.get("/payment-status", async (req, res) => {
  try {
    const paymentStatuses = await paymentStatusCollection.find().toArray();
    res.json(paymentStatuses);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy trạng thái thanh toán", error: error.message });
  }
});

// Sản phẩm (trùng với file gốc nên comment lại, giữ nguyên API từ file gốc)
// app.get("/products", async (req, res) => {
//   try {
//     const products = await productCollection.find().toArray();
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm", error: error.message });
//   }
// });

// Xóa đơn hàng
// app.delete("/orders/:id", async (req, res) => {
//   try {
//     const orderId = req.params.id;
//     const result = await orderCollection.deleteOne({ _id: new ObjectId(orderId) });
//     if (result.deletedCount === 0) {
//       return res.status(404).json({ message: "Không tìm thấy đơn hàng để xóa" });
//     }
//     res.json({ message: "Đơn hàng đã được xóa thành công!" });
//   } catch (error) {
//     console.error("Lỗi khi xóa đơn hàng:", error);
//     res.status(500).json({ message: "Lỗi server khi xóa đơn hàng" });
//   }
// });

// // API tạo đơn hàng mới
// app.post("/orders", async (req, res) => {
//   try {
//     const newOrder = req.body;
//     console.log('Dữ liệu nhận từ frontend:', newOrder);
//     if (!newOrder || !newOrder.CustomerID || !newOrder.OrderID) {
//       console.log('Dữ liệu không hợp lệ:', { CustomerID: newOrder.CustomerID, OrderID: newOrder.OrderID });
//       return res.status(400).json({ message: "Dữ liệu đơn hàng không hợp lệ" });
//     }
//     newOrder.createdAt = new Date();
//     const result = await orderCollection.insertOne(newOrder);
//     if (result.acknowledged) {
//       res.status(201).json({ message: "Đơn hàng đã được tạo thành công!", OrderID: result.insertedId });
//     } else {
//       res.status(500).json({ message: "Không thể tạo đơn hàng" });
//     }
//   } catch (error) {
//     console.error("Lỗi khi tạo đơn hàng:", error);
//     res.status(500).json({ message: "Lỗi server khi tạo đơn hàng", error: error.message });
//   }
// });

// // Cập nhật đơn hàng
// app.put("/orders/:id", async (req, res) => {
//   try {
//     const orderId = req.params.id;
//     const updatedOrder = req.body;
//     const result = await orderCollection.updateOne(
//       { _id: new ObjectId(orderId) },
//       { $set: updatedOrder }
//     );
//     if (result.matchedCount === 0) {
//       return res.status(404).json({ message: "Không tìm thấy đơn hàng để cập nhật" });
//     }
//     res.json({ message: "Cập nhật đơn hàng thành công!" });
//   } catch (error) {
//     console.error("Lỗi khi cập nhật đơn hàng:", error);
//     res.status(500).json({ message: "Lỗi server khi cập nhật đơn hàng" });
//   }
// });

// API lấy danh sách voucher
// app.get("/vouchers", async (req, res) => {
//   try {
//     const vouchers = await voucherCollection.find().toArray();
//     console.log('Danh sách voucher:', vouchers);
//     res.json(vouchers);
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi khi lấy danh sách voucher", error: error.message });
//   }
// });

// API lấy danh sách điều kiện voucher
app.get("/voucher-conditions", async (req, res) => {
  try {
    const conditions = await voucherConditionCollection.find().toArray();
    res.json(conditions);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách điều kiện voucher:", error);
    res.status(500).json({ message: "Lỗi server khi lấy điều kiện voucher", error: error.message });
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

// ===================== SERVER START =====================

app.listen(port, () => {
  logger.info(`Server running on port ${port}`, { correlationId: 'system' });
});

process.on('SIGTERM', async () => {
  await client.close();
  logger.info('MongoDB connection closed', { correlationId: 'system' });
  process.exit(0);
});

//==============================PROMOTIONS AND VOUCHERS===================================
// GET /promotions (Lấy tất cả promotions)
app.get("/promotions", cors(), async (req, res) => {
  try {
    const promotions = await promotionsCollection.find({}).toArray();
    
    // Thêm ScopeName cho từng promotion, tương tự như trong /combined-data-promotions
    const promotionsWithScope = await Promise.all(promotions.map(async (promotion) => {
      const scopeId = promotion.ScopeID !== undefined ? Number(promotion.ScopeID) : 0; // Chuẩn hóa ScopeID
      console.log(`Debug: PromotionID=${promotion.PromotionID}, Raw ScopeID=${promotion.ScopeID}, Converted ScopeID=${scopeId}`); // Log chi tiết
      const scope = await promotionScopeCollection.findOne({ ScopeID: scopeId }); // Sử dụng ScopeID
      console.log(`Debug: Promotion Scope found for ScopeID ${scopeId}:`, scope); // Log kết quả truy vấn
      const scopeName = scope && scope.SCOPE ? scope.SCOPE : 'Toàn ngành hàng'; // Sử dụng SCOPE (in hoa) để khớp với dữ liệu thực tế
      console.log(`Debug: PromotionID=${promotion.PromotionID}, ScopeName=${scopeName}`); // Log ScopeName
      return { ...promotion, ScopeName: scopeName, type: 'promotion' };
    }));

    res.status(200).json(promotionsWithScope);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách promotions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /promotions/:id
app.get("/promotions/:id", cors(), async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params["id"])) {
      return res.status(400).json({ message: "Invalid promotion ID" });
    }

    const o_id = new ObjectId(req.params["id"]);
    const promotion = await promotionsCollection.findOne({ _id: o_id });

    if (promotion) {
      const scopeId = promotion.ScopeID !== undefined ? Number(promotion.ScopeID) : 0; // Chuẩn hóa ScopeID
      console.log(`Debug: PromotionID=${promotion.PromotionID}, Raw ScopeID=${promotion.ScopeID}, Converted ScopeID=${scopeId}`); // Log chi tiết
      const scope = await promotionScopeCollection.findOne({ ScopeID: scopeId }); // Sử dụng ScopeID
      console.log(`Debug: Promotion Scope found for ScopeID ${scopeId}:`, scope); // Log kết quả truy vấn
      const scopeName = scope && scope.SCOPE ? scope.SCOPE : 'Toàn ngành hàng'; // Sử dụng SCOPE (in hoa) để khớp với dữ liệu thực tế
      console.log(`Debug: PromotionID=${promotion.PromotionID}, ScopeName=${scopeName}`); // Log ScopeName
      res.status(200).json({ ...promotion, ScopeName: scopeName, type: 'promotion' });
    } else {
      res.status(404).json({ message: "Promotion not found" });
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy promotion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /vouchers (Lấy tất cả vouchers)
app.get("/vouchers", cors(), async (req, res) => {
  try {
    const vouchers = await voucherCollection.find({}).toArray();

    if (!vouchers || vouchers.length === 0) {
      console.log("Debug: Không tìm thấy voucher nào.");
      return res.status(200).json([]);
    }

    // Thêm UsedCount, RemainingQuantity và ScopeName cho từng voucher
    const vouchersWithDetails = await Promise.all(vouchers.map(async (voucher) => {
      const usedCount = await orderCollection.countDocuments({ VoucherID: voucher.VoucherID || '' });
      const scopeId = voucher.ScopeID !== undefined ? Number(voucher.ScopeID) : 0; // Chuẩn hóa ScopeID
      console.log(`Debug: VoucherID=${voucher.VoucherID}, Raw ScopeID=${voucher.ScopeID}, Converted ScopeID=${scopeId}`); // Log chi tiết
      const scope = await promotionScopeCollection.findOne({ ScopeID: scopeId }); // Sử dụng ScopeID
      console.log(`Debug: Voucher Scope found for ScopeID ${scopeId}:`, scope); // Log kết quả truy vấn
      const scopeName = scope && scope.SCOPE ? scope.SCOPE : 'Toàn ngành hàng'; // Sử dụng SCOPE (in hoa) để khớp với dữ liệu thực tế
      console.log(`Debug: VoucherID=${voucher.VoucherID}, ScopeName=${scopeName}`); // Log ScopeName
      return {
        ...voucher,
        UsedCount: usedCount,
        RemainingQuantity: voucher.VoucherQuantity - usedCount,
        ScopeName: scopeName,
        type: 'voucher'
      };
    }));

    console.log("Debug: Final vouchersWithDetails:", vouchersWithDetails);
    res.status(200).json(vouchersWithDetails);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách vouchers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /vouchers/:id
app.get("/vouchers/:id", cors(), async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params["id"])) {
      return res.status(400).json({ message: "Invalid voucher ID" });
    }

    const o_id = new ObjectId(req.params["id"]);
    const voucher = await voucherCollection.findOne({ _id: o_id });

    if (voucher) {
      const usedCount = await orderCollection.countDocuments({ VoucherID: voucher.VoucherID || '' });
      const scopeId = voucher.ScopeID !== undefined ? Number(voucher.ScopeID) : 0; // Chuẩn hóa ScopeID
      console.log(`Debug: VoucherID=${voucher.VoucherID}, Raw ScopeID=${voucher.ScopeID}, Converted ScopeID=${scopeId}`); // Log chi tiết
      const scope = await promotionScopeCollection.findOne({ ScopeID: scopeId }); // Sử dụng ScopeID
      console.log(`Debug: Voucher Scope found for ScopeID ${scopeId}:`, scope); // Log kết quả truy vấn
      const scopeName = scope && scope.SCOPE ? scope.SCOPE : 'Toàn ngành hàng'; // Sử dụng SCOPE (in hoa) để khớp với dữ liệu thực tế
      console.log(`Debug: VoucherID=${voucher.VoucherID}, ScopeName=${scopeName}`); // Log ScopeName
      res.status(200).json({
        ...voucher,
        UsedCount: usedCount,
        RemainingQuantity: voucher.VoucherQuantity - usedCount,
        ScopeName: scopeName,
        type: 'voucher'
      });
    } else {
      res.status(404).json({ message: "Voucher not found" });
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy voucher:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /combined-data-promotions
app.get("/combined-data-promotions", cors(), async (req, res) => {
  try {
    const promotions = await promotionsCollection.find({}).toArray();
    const vouchers = await voucherCollection.find({}).toArray();
    const promotionStatuses = await promotionStatusesCollection.find({}).toArray();
    const voucherStatuses = await voucherConditionCollection.find({}).toArray();
    const promotionScopes = await promotionScopeCollection.find({}).toArray();

    // Thêm UsedCount và ScopeName cho vouchers
    const vouchersWithUsage = await Promise.all(vouchers.map(async (voucher) => {
      const usedCount = await orderCollection.countDocuments({ VoucherID: voucher.VoucherID || '' });
      const scopeId = voucher.ScopeID !== undefined ? Number(voucher.ScopeID) : 0; // Chuẩn hóa ScopeID
      console.log(`Debug: VoucherID=${voucher.VoucherID}, ScopeID=${scopeId}`); // Debug ScopeID
      const scope = await promotionScopeCollection.findOne({ ScopeID: scopeId }); // Sửa thành ScopeID để khớp với dữ liệu
      console.log(`Debug: Voucher Scope found for ScopeID ${scopeId}:`, scope); // Debug kết quả truy vấn
      const scopeName = scope && scope.Scope ? scope.Scope : 'Toàn ngành hàng'; // Sửa thành Scope để khớp với dữ liệu
      return {
        ...voucher,
        UsedCount: usedCount,
        RemainingQuantity: voucher.VoucherQuantity - usedCount,
        ScopeName: scopeName,
        type: 'voucher'
      };
    }));

    // Thêm ScopeName cho promotions
    const promotionsWithScope = await Promise.all(promotions.map(async (promotion) => {
      const scopeId = promotion.ScopeID !== undefined ? Number(promotion.ScopeID) : 0; // Chuẩn hóa ScopeID
      console.log(`Debug: PromotionID=${promotion.PromotionID}, ScopeID=${scopeId}`); // Debug ScopeID
      const scope = await promotionScopeCollection.findOne({ ScopeID: scopeId }); // Sửa thành ScopeID để khớp với dữ liệu
      console.log(`Debug: Promotion Scope found for ScopeID ${scopeId}:`, scope); // Debug kết quả truy vấn
      const scopeName = scope && scope.Scope ? scope.Scope : 'Toàn ngành hàng'; // Sửa thành Scope để khớp với dữ liệu
      return {
        ...promotion,
        ScopeName: scopeName,
        type: 'promotion'
      };
    }));

    const combinedItems = [...promotionsWithScope, ...vouchersWithUsage].sort((a, b) => {
      const dateA = new Date(a.type === 'promotion' ? a.PromotionStartDate : a.VoucherStartDate).getTime();
      const dateB = new Date(b.type === 'promotion' ? b.PromotionStartDate : b.VoucherStartDate).getTime();
      if (dateA !== dateB) {
        return dateB - dateA;
      }
      return a.type === 'promotion' && b.type === 'voucher' ? -1 : 1;
    });

    const combinedData = {
      promotions: combinedItems.filter(item => item.type === 'promotion'),
      vouchers: combinedItems.filter(item => item.type === 'voucher'),
      promotionStatuses: promotionStatuses,
      voucherStatuses: voucherStatuses,
      promotionScopes: promotionScopes,
      total: {
        promotions: combinedItems.filter(item => item.type === 'promotion').length,
        vouchers: combinedItems.filter(item => item.type === 'voucher').length
      }
    };

    res.status(200).json(combinedData);
  } catch (error) {
    console.error("❌ Lỗi khi xử lý /combined-data-promotions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /promotions/:id
app.delete("/promotions/:id", cors(), async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params["id"])) {
      return res.status(400).json({ message: "Invalid promotion ID" });
    }

    const o_id = new ObjectId(req.params["id"]);
    const result = await promotionsCollection.deleteOne({ _id: o_id });
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Promotion deleted successfully" });
    } else {
      res.status(404).json({ message: "Promotion not found" });
    }
  } catch (error) {
    console.error("❌ Lỗi khi xóa promotion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /vouchers/:id
app.delete("/vouchers/:id", cors(), async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params["id"])) {
      return res.status(400).json({ message: "Invalid voucher ID" });
    }

    const o_id = new ObjectId(req.params["id"]);
    const result = await voucherCollection.deleteOne({ _id: o_id });
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Voucher deleted successfully" });
    } else {
      res.status(404).json({ message: "Voucher not found" });
    }
  } catch (error) {
    console.error("❌ Lỗi khi xóa voucher:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /promotions/:id/end
app.put("/promotions/:id/end", cors(), async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params["id"])) {
      return res.status(400).json({ message: "Invalid promotion ID" });
    }

    const o_id = new ObjectId(req.params["id"]);
    const today = new Date().toISOString();
    const result = await promotionsCollection.updateOne(
      { _id: o_id },
      { $set: { PromotionExpiredDate: today } }
    );
    if (result.matchedCount === 1) {
      res.status(200).json({ message: "Promotion ended successfully" });
    } else {
      res.status(404).json({ message: "Promotion not found" });
    }
  } catch (error) {
    console.error("❌ Lỗi khi kết thúc promotion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /vouchers/:id/end
app.put("/vouchers/:id/end", cors(), async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params["id"])) {
      return res.status(400).json({ message: "Invalid voucher ID" });
    }

    const o_id = new ObjectId(req.params["id"]);
    const today = new Date().toISOString();
    const result = await voucherCollection.updateOne(
      { _id: o_id },
      { $set: { VoucherExpiredDate: today } }
    );
    if (result.matchedCount === 1) {
      res.status(200).json({ message: "Voucher ended successfully" });
    } else {
      res.status(404).json({ message: "Voucher not found" });
    }
  } catch (error) {
    console.error("❌ Lỗi khi kết thúc voucher:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /promotions/:id
app.put("/promotions/:id", cors(), async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params["id"])) {
      return res.status(400).json({ message: "Invalid promotion ID" });
    }

    const o_id = new ObjectId(req.params["id"]);
    const updateData = req.body;
    const result = await promotionsCollection.updateOne(
      { _id: o_id },
      { $set: {
        PromotionID: updateData.PromotionID,
        PromotionStartDate: updateData.PromotionStartDate,
        PromotionExpiredDate: updateData.PromotionExpiredDate,
        PromotionConditionID: updateData.PromotionConditionID,
        PromotionValue: updateData.PromotionValue,
        SCOPEID: updateData.SCOPEID || 0 // Đảm bảo SCOPEID mặc định là 0 nếu không có
      }}
    );
    if (result.matchedCount === 1) {
      res.status(200).json({ message: "Promotion updated successfully" });
    } else {
      res.status(404).json({ message: "Promotion not found" });
    }
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật promotion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /vouchers/:id
app.put("/vouchers/:id", cors(), async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params["id"])) {
      return res.status(400).json({ message: "Invalid voucher ID" });
    }

    const o_id = new ObjectId(req.params["id"]);
    const updateData = req.body;
    const result = await voucherCollection.updateOne(
      { _id: o_id },
      { $set: {
        VoucherID: updateData.VoucherID,
        VoucherStartDate: updateData.VoucherStartDate,
        VoucherExpiredDate: updateData.VoucherExpiredDate,
        VoucherConditionID: updateData.VoucherConditionID,
        VoucherQuantity: updateData.VoucherQuantity,
        VoucherValue: updateData.VoucherValue,
        RemainingQuantity: updateData.RemainingQuantity,
        SCOPEID: updateData.SCOPEID || 0 // Đảm bảo SCOPEID mặc định là 0 nếu không có
      }}
    );
    if (result.matchedCount === 1) {
      res.status(200).json({ message: "Voucher updated successfully" });
    } else {
      res.status(404).json({ message: "Voucher not found" });
    }
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật voucher:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /promotions
app.post("/promotions", cors(), async (req, res) => {
  try {
    const newPromotion = req.body;
    const result = await promotionsCollection.insertOne({
      ...newPromotion,
      SCOPEID: newPromotion.SCOPEID || 0 // Đảm bảo SCOPEID mặc định là 0 nếu không có
    });
    res.status(201).json({ message: "Promotion created successfully", id: result.insertedId });
  } catch (error) {
    console.error("❌ Lỗi khi tạo mới promotion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /vouchers
app.post("/vouchers", cors(), async (req, res) => {
  try {
    const newVoucher = req.body;
    const result = await voucherCollection.insertOne({
      ...newVoucher,
      SCOPEID: newVoucher.SCOPEID || 0 // Đảm bảo SCOPEID mặc định là 0 nếu không có
    });
    res.status(201).json({ message: "Voucher created successfully", id: result.insertedId });
  } catch (error) {
    console.error("❌ Lỗi khi tạo mới voucher:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});