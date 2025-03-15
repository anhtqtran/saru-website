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
let client, database, productCollection, imageCollection, categoryCollection, reviewCollection, orderDetailCollection, accountCollection, customerCollection;
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

// app.get('/api/products', async (req, res) => {
//   try {
//     const page = Math.max(1, parseInt(req.query.page) || 1);
//     const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 100));
//     const skip = (page - 1) * limit;

//     const filter = {};
//     if (req.query.brand) filter.ProductBrand = req.query.brand;
//     if (req.query.category) filter.CateID = req.query.category;
//     if (req.query.minPrice || req.query.maxPrice) {
//       filter.ProductPrice = {};
//       if (req.query.minPrice) filter.ProductPrice.$gte = parseInt(req.query.minPrice);
//       if (req.query.maxPrice) filter.ProductPrice.$lte = parseInt(req.query.maxPrice);
//     }
//     if (req.query.wineVolume) filter.WineVolume = req.query.wineVolume;
//     if (req.query.wineType) filter.WineType = req.query.wineType;
//     if (req.query.wineIngredient) filter.WineIngredient = req.query.wineIngredient;
//     if (req.query.wineFlavor) filter.WineFlavor = req.query.wineFlavor;
//     if (req.query.bestSellers === 'true') filter.isBestSeller = true;
//     if (req.query.onSale === 'true') filter.isPromotion = true;

    

//     const sortOptions = {
//       'priceAsc': { ProductPrice: 1 },
//       'priceDesc': { ProductPrice: -1 }
//     };
//     const sort = sortOptions[req.query.sort] || { ProductPrice: -1 };

//     const [items, total] = await Promise.all([
//       productCollection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
//       productCollection.countDocuments(filter)
//     ]);

//     const cateIDs = [...new Set(items.map(p => p.CateID))];
//     const categories = await categoryCollection.find({ CateID: { $in: cateIDs } }).toArray();
//     const cateMap = categories.reduce((acc, cur) => {
//       acc[cur.CateID] = cur.CateName;
//       return acc;
//     }, {});

//     const productsWithCategories = items.map(p => ({
//       ...p,
//       CateName: cateMap[p.CateID] || 'Unknown'
//     }));
//     res.json({
//       data: productsWithCategories,
//       pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total }
//     });
//   } catch (err) {
//     logger.error('Error in GET /api/products', { error: err.message, correlationId: req.correlationId });
//     res.status(500).json({ error: err.message });
//   }
// });

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


//  API lưu đánh giá sản phẩm
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

//  API lấy đánh giá sản phẩm
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await reviewCollection.find().sort({ DatePosted: -1 }).toArray();
    res.json(reviews);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách đánh giá:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * API lấy đánh giá của một sản phẩm cụ thể
 * Method: GET
 * URL: /api/reviews/:productId
 */
app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!productId) {
      return res.status(400).json({ error: "Thiếu ID sản phẩm!" });
    }

    // 🔹 Tìm các đánh giá của sản phẩm theo ProductID
    const reviews = await reviewCollection.find({ ProductID: productId })
      .sort({ DatePosted: -1 }) // Sắp xếp theo ngày mới nhất
      .toArray();

    res.json(reviews);
  } catch (err) {
    console.error("Lỗi khi lấy đánh giá của sản phẩm:", err);
    res.status(500).json({ error: err.message });
  }
});


/**
 * API lưu đánh giá sản phẩm
 * Method: POST
 * URL: /api/reviews
 */
app.post('/api/reviews', async (req, res) => {
  try {
    const { ReviewID, ProductID, CustomerID, Content, Rating, DatePosted, Images } = req.body;

    if (!ProductID || !CustomerID || !Rating || !Content) {
      return res.status(400).json({ error: "Thiếu thông tin đánh giá!" });
    }

    const newReview = {
      ReviewID: `review_${new Date().getTime()}`,  // Tạo ID tự động nếu không có
      ProductID,
      CustomerID,
      Content,
      Rating: Math.min(Math.max(Rating, 1), 5), // Giữ rating trong khoảng 1-5
      DatePosted: new Date().toISOString(), // 🔹 Lưu ngày theo chuẩn ISO
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
          ProductName: "$productInfo.ProductName",// ✅ Lấy tên sản phẩm
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
///Connect images với products
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
      // Thêm limit nếu cần
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
    // Lấy danh sách sản phẩm
    const products = await database.collection('products').find({}).toArray();
    
    // Lấy danh sách tồn kho
    const stocks = await database.collection('productstocks').find({}).toArray();

    // Tạo một Map từ stocks để truy xuất nhanh
    const stockMap = stocks.reduce((acc, stock) => {
      acc[stock.ProductID] = stock.StockQuantity;
      return acc;
    }, {});

    // Gán tồn kho vào sản phẩm
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
      // Gộp với collection `productstocks` để lấy tồn kho
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

      // Gộp với collection `images` để lấy ảnh sản phẩm
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

      // Gộp với collection `categories` để lấy thông tin danh mục sản phẩm
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

      // Chọn các trường cần trả về
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

///Thêm nhật sản phẩm
// app.post('/api/products', async (req, res) => {
//   try {
//     const { ProductID, ImageID, CateID, ProductName, ProductPrice, ProductBrand, 
//             ProductFullDescription, ProductShortDescription, ProductSKU, ProductImages, StockQuantity } = req.body;

//     // Kiểm tra nếu ImageID chưa tồn tại trong `images` thì thêm mới
//     const existingImage = await imageCollection.findOne({ ImageID });
//     if (!existingImage) {
//       const imageData = {
//         ImageID,
//         ProductImageCover: ProductImages[0] || "", // Ảnh chính
//         ProductImageSub1: ProductImages[1] || "",
//         ProductImageSub2: ProductImages[2] || "",
//         ProductImageSub3: ProductImages[3] || "",
//       };
//       await imageCollection.insertOne(imageData);
//     }

//     // Thêm sản phẩm vào `products`
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

//     // ✅ Cập nhật số lượng tồn kho vào `productstocks`
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










// API xử lý upload ảnh
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    // Giả sử bạn upload lên Cloudinary hoặc Firebase ở đây
    const imageUrl = `https://your-cloud.com/${req.file.filename}`;

    res.json({ message: "Upload thành công!", url: imageUrl });
  } catch (err) {
    console.error("❌ Lỗi upload ảnh:", err);
    res.status(500).json({ error: err.message });
  }
});

// API cập nhật sản phẩm:
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

//     // Xóa các trường không cần thiết để tránh ghi đè
//     delete updatedData._id; // Không cho phép cập nhật _id
//     delete updatedData.ProductID; // Không cho phép cập nhật ProductID

//     // Chuyển đổi productId thành ObjectID
//     let query = { _id: new ObjectId(productId) };
//     const result = await productCollection.updateOne(query, { $set: updatedData });

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ message: "Sản phẩm không tồn tại." });
//     }

//     // Cập nhật số lượng tồn kho nếu có
//     if (updatedData.StockQuantity !== undefined) {
//       await database.collection('productstocks').updateOne(
//         { ProductID: updatedData.ProductID || req.body.ProductID }, // Sử dụng ProductID từ dữ liệu
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


///API get
// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    // Kiểm tra nếu id không phải là ObjectID hợp lệ
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
        _id: product._id.toString(), // Đảm bảo trả về _id
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
// PUT /api/products/:id
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = req.body;

    // Kiểm tra xem sản phẩm với ProductID đã tồn tại chưa
    const existingProduct = await productCollection.findOne({ ProductID: newProduct.ProductID });
    if (existingProduct) {
      return res.status(400).json({ message: "Sản phẩm với ProductID này đã tồn tại." });
    }

    const result = await productCollection.insertOne(newProduct);

    // Thêm ảnh nếu có
    if (newProduct.ProductImages && newProduct.ProductImages.length > 0) {
      await imageCollection.insertOne({
        ImageID: newProduct.ImageID,
        ProductImageCover: newProduct.ProductImages[0] || "",
        ProductImageSub1: newProduct.ProductImages[1] || "",
        ProductImageSub2: newProduct.ProductImages[2] || "",
        ProductImageSub3: newProduct.ProductImages[3] || ""
      });
    }

    // Thêm số lượng tồn kho
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





// ===================== SERVER START =====================

app.listen(port, () => {
  logger.info(`Server running on port ${port}`, { correlationId: 'system' });
});

process.on('SIGTERM', async () => {
  await client.close();
  logger.info('MongoDB connection closed', { correlationId: 'system' });
  process.exit(0);
});

