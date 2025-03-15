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
const cron = require('node-cron');
const multer = require('multer'); // Thêm dòng này

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
app.use(bodyParser.json({ limit: '50mb' })); // Cập nhật từ đoạn code ngắn
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // Cập nhật từ đoạn code ngắn
app.use(express.json({ limit: '50mb' })); // Cập nhật từ đoạn code ngắn
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Thêm từ đoạn code ngắn

app.use(cors({
  origin: ['http://localhost:4001', 'http://localhost:4002', 'http://localhost:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Thêm từ đoạn code ngắn
  allowedHeaders: ['Content-Type', 'Authorization'] // Thêm từ đoạn code ngắn
}));

// Middleware để gán correlationId cho mỗi request
app.use((req, res, next) => {
  req.correlationId = uuidv4();
  next();
});

// Cấu hình Multer
const storage = multer.memoryStorage(); // Lưu ảnh vào bộ nhớ trước khi xử lý
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // Giới hạn 5MB

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
// Khai báo các biến toàn cục
let client;
let database;
let productCollection, imageCollection, categoryCollection, reviewCollection, orderDetailCollection, accountCollection, customerCollection, productstockCollection, blogCollection, blogCategoryCollection, faqCollection, membershipCollection, orderCollection, messageCollection;


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
    productstockCollection = database.collection('productstocks');
    blogCollection = database.collection('blogs');
    blogCategoryCollection = database.collection('blogcategories');
    faqCollection = database.collection('faqs');
    membershipCollection = database.collection('memberships');
    orderCollection = database.collection('orders');
    messageCollection = database.collection('consultants');


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


// //===Kết nối Mongoose
// mongoose.connect(process.env.MONGODB_URI).then(() => {
//   logger.info('Connected to MongoDB with Mongoose', { correlationId: 'system' });
// }).catch(err => {
//   logger.error('Failed to connect to MongoDB with Mongoose', { error: err.message, correlationId: 'system' });
//   process.exit(1);
// });

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

const bestSellingProductsPipeline = (productId) => [
  ...(productId ? [] : [{ $group: { _id: "$ProductID", totalQuantity: { $sum: "$Quantity" } } }]),
  ...(productId ? [{ $match: { _id: productId } }] : []),
  ...(productId ? [] : [{ $sort: { totalQuantity: -1 } }]),
  ...(productId ? [] : [{ $limit: 5 }]),
  {
    $lookup: {
      from: "products",
      let: { pid: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$ProductID", "$$pid"] } } },
        {
          $lookup: {
            from: "images",
            let: { imageId: "$ImageID" },
            pipeline: [
              { $match: { $expr: { $eq: ["$ImageID", "$$imageId"] } } },
              { $project: { _id: 0, ProductImageCover: 1 } }
            ],
            as: "image"
          }
        },
        { $unwind: { path: "$image", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "productcategories",
            let: { cateId: "$CateID" },
            pipeline: [
              { $match: { $expr: { $eq: ["$CateID", "$$cateId"] } } },
              { $project: { _id: 0, CateName: 1 } }
            ],
            as: "category"
          }
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "reviews",
            let: { productId: "$ProductID" },
            pipeline: [
              { $match: { $expr: { $eq: ["$ProductID", "$$productId"] } } },
              {
                $group: {
                  _id: null,
                  averageRating: { $avg: "$Rating" },
                  reviewCount: { $sum: 1 }
                }
              }
            ],
            as: "reviews"
          }
        },
        { $unwind: { path: "$reviews", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            ProductID: 1,
            ProductName: 1,
            ProductPrice: 1,
            ProductImageCover: { $ifNull: ["$image.ProductImageCover", "default-image-url"] },
            CateName: { $ifNull: ["$category.CateName", "Không có danh mục"] },
            averageRating: { $ifNull: ["$reviews.averageRating", 0] },
            reviewCount: { $ifNull: ["$reviews.reviewCount", 0] },
            description: 1,
            relatedProducts: 1
          }
        }
      ],
      as: "product"
    }
  },
  { $match: { "product": { $ne: [] } } },
  { $unwind: { path: "$product", preserveNullAndEmptyArrays: false } },
  {
    $project: {
      _id: "$product._id",
      productId: "$_id",
      productName: "$product.ProductName",
      productPrice: "$product.ProductPrice",
      productImageCover: "$product.ProductImageCover",
      categoryName: "$product.CateName",
      totalQuantity: { $ifNull: ["$totalQuantity", 0] },
      averageRating: "$product.averageRating",
      reviewCount: "$product.reviewCount",
      description: "$product.description",
      relatedProducts: "$product.relatedProducts"
    }
  }
];

app.get('/api/products/best-selling', async (req, res) => {
  try {
    console.log('Request received:', req.method, req.url, req.query);

    if (Object.keys(req.query).length > 0) {
      console.log('Query params not supported:', req.query);
      return res.status(400).json({ message: 'This endpoint does not accept query parameters' });
    }

    const bestSellingProducts = await orderDetailCollection.aggregate(bestSellingProductsPipeline()).toArray();
    console.log('Aggregation result:', bestSellingProducts);

    if (!bestSellingProducts.length) {
      console.log('No best-selling products found');
      return res.status(200).json([]);
    }

    res.status(200).json(bestSellingProducts);
  } catch (err) {
    console.error('Aggregation error:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/products/map-id/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log('Request received for mapping ProductID to _id:', req.method, req.url, { productId });

    const product = await productCollection.findOne(
      { ProductID: productId },
      { projection: { _id: 1 } }
    );

    if (!product) {
      console.log('Product not found for ProductID:', productId);
      return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
    }

    res.status(200).json({ _id: product._id.toHexString() });
  } catch (err) {
    console.error('Error mapping ProductID to _id:', err.stack);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

app.get('/api/products/best-seller-detail/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log('Request received for best-seller-detail:', req.method, req.url, { productId });

    const pipeline = bestSellingProductsPipeline(productId);
    const result = await orderDetailCollection.aggregate(pipeline).toArray();

    if (!result.length) {
      console.log('No best seller detail found for productId:', productId);
      return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
    }

    console.log('Best seller detail result:', result[0]);
    res.status(200).json(result[0]);
  } catch (err) {
    console.error('Aggregation error for best seller detail:', err.stack);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

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
    logger.error('Error in GET /api/products/search', { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await categoryCollection.find().toArray();
    res.json(categories);
  } catch (err) {
    logger.error('Error in GET /api/categories', { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    console.log("📢 API `/api/products` đã được gọi!"); // Thêm log từ đoạn code ngắn

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
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
    if (req.query.onSale === 'true') filter.PromotionID = { $ne: null };

    const sortOptions = {
      'priceAsc': { ProductPrice: 1 },
      'priceDesc': { ProductPrice: -1 }
    };
    const sort = sortOptions[req.query.sort] || { ProductPrice: -1 };

    const [items, total] = await Promise.all([
      productCollection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      productCollection.countDocuments(filter)
    ]);

    const productIDs = items.map(p => p.ProductID);
    const promotionIDs = items.map(p => p.PromotionID).filter(id => id !== null);

    // Gộp với collection images từ đoạn code ngắn
    const productsWithImages = await database.collection('products').aggregate([
      { $match: { ProductID: { $in: productIDs } } },
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
          ProductBrand: 1,
          ImageID: 1,
          ProductPrice: 1,
          PromotionID: 1,
          ProductImageCover: { $ifNull: ['$imageData.ProductImageCover', ''] },
          ProductImageSub1: { $ifNull: ['$imageData.ProductImageSub1', ''] },
          ProductImageSub2: { $ifNull: ['$imageData.ProductImageSub2', ''] },
          ProductImageSub3: { $ifNull: ['$imageData.ProductImageSub3', ''] }
        }
      }
    ]).toArray();

    // Map sản phẩm với ảnh vào items
    const productMap = productsWithImages.reduce((acc, p) => {
      acc[p.ProductID] = p;
      return acc;
    }, {});

    const stocks = await productstockCollection.find({ ProductID: { $in: productIDs } }).toArray();
    const stockMap = stocks.reduce((acc, stock) => {
      acc[stock.ProductID] = stock.StockQuantity;
      return acc;
    }, {});

    const promotions = await database.collection('promotions').find({ PromotionID: { $in: promotionIDs } }).toArray();
    const promotionMap = promotions.reduce((acc, promo) => {
      acc[promo.PromotionID] = {
        startDate: new Date(promo.PromotionStartDate),
        expiredDate: new Date(promo.PromotionExpiredDate),
        value: promo.PromotionValue
      };
      return acc;
    }, {});

    const reviewsAgg = await reviewCollection.aggregate([
      { $match: { ProductID: { $in: productIDs } } },
      {
        $group: {
          _id: "$ProductID",
          averageRating: { $avg: { $min: [{ $max: ["$Rating", 0] }, 5] } },
          totalReviewCount: { $sum: 1 }
        }
      }
    ]).toArray();
    const reviewMap = reviewsAgg.reduce((acc, r) => {
      acc[r._id] = {
        averageRating: Number(r.averageRating.toFixed(1)) || null,
        totalReviewCount: r.totalReviewCount || 0
      };
      return acc;
    }, {});

    const cateIDs = [...new Set(items.map(p => p.CateID))];
    const categories = await categoryCollection.find({ CateID: { $in: cateIDs } }).toArray();
    const cateMap = categories.reduce((acc, cur) => {
      acc[cur.CateID] = cur.CateName;
      return acc;
    }, {});

    const currentDate = new Date('2025-03-11');

    const productsWithDetails = items.map(p => {
      const stockQuantity = stockMap[p.ProductID] || 0;
      const stockStatus = stockQuantity > 0 ? 'In Stock' : 'Out of Stock';

      let isOnSale = false;
      let currentPrice = p.ProductPrice || 0;
      let discountPercentage = 0;

      if (p.PromotionID !== null) {
        const promo = promotionMap[p.PromotionID];
        if (promo) {
          const startDate = promo.startDate;
          const expiredDate = promo.expiredDate;
          const promotionValue = promo.value;

          if (currentDate >= startDate && currentDate <= expiredDate) {
            const discountMultiplier = 1 - (promotionValue / 100);
            currentPrice = p.ProductPrice * discountMultiplier;
            isOnSale = true;
            discountPercentage = promotionValue;
          }
        }
      }

      const reviewData = reviewMap[p.ProductID] || { averageRating: null, totalReviewCount: 0 };
      const productWithImage = productMap[p.ProductID] || {};

      return {
        ...p,
        CateName: cateMap[p.CateID] || 'Unknown',
        currentPrice: currentPrice,
        originalPrice: p.ProductPrice || 0,
        stockStatus: stockStatus,
        isOnSale: isOnSale,
        discountPercentage: discountPercentage,
        averageRating: reviewData.averageRating,
        totalReviewCount: reviewData.totalReviewCount,
        ProductImageCover: productWithImage.ProductImageCover || '',
        ProductImageSub1: productWithImage.ProductImageSub1 || '',
        ProductImageSub2: productWithImage.ProductImageSub2 || '',
        ProductImageSub3: productWithImage.ProductImageSub3 || ''
      };
    });

    if (!productsWithDetails.length) {
      console.log('⚠️ Không tìm thấy dữ liệu'); // Thêm log từ đoạn code ngắn
    }

    console.log("📢 Dữ liệu trả về:", JSON.stringify(productsWithDetails, null, 2)); // Thêm log từ đoạn code ngắn

    res.json({
      data: productsWithDetails,
      pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total }
    });
  } catch (err) {
    console.error('❌ Lỗi chi tiết:', err.stack); // Thêm log lỗi chi tiết từ đoạn code ngắn
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

app.get('/api/products/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      logger.warn('Invalid ObjectId provided', { id: req.params.id, correlationId: req.correlationId });
      return res.status(400).json({ message: 'ID sản phẩm không hợp lệ.' });
    }

    const productId = new ObjectId(req.params.id);
    const product = await productCollection.findOne({ _id: productId });
    if (!product) {
      logger.info('Product not found', { id: req.params.id, correlationId: req.correlationId });
      return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
    }

    const stock = await productstockCollection.findOne({ ProductID: product.ProductID });
    const stockQuantity = stock ? stock.StockQuantity : 0;
    const stockStatus = stockQuantity > 0 ? 'In Stock' : 'Out of Stock';

    let isOnSale = false;
    let currentPrice = product.ProductPrice || 0;
    let discountPercentage = 0;
    const currentDate = new Date('2025-03-11');

    if (product.PromotionID) {
      const promo = await database.collection('promotions').findOne({ PromotionID: product.PromotionID });
      if (promo) {
        const startDate = new Date(promo.PromotionStartDate);
        const expiredDate = new Date(promo.PromotionExpiredDate);
        const promotionValue = promo.PromotionValue;

        if (currentDate >= startDate && currentDate <= expiredDate) {
          const discountMultiplier = 1 - (promotionValue / 100);
          currentPrice = product.ProductPrice * discountMultiplier;
          isOnSale = true;
          discountPercentage = promotionValue;
        }
      }
    }

    const image = await imageCollection.findOne({ ImageID: product.ImageID }) || {};
    const productWithImages = {
      ...product,
      ProductImageCover: image.ProductImageCover || '',
      ProductImageSub1: image.ProductImageSub1 || '',
      ProductImageSub2: image.ProductImageSub2 || '',
      ProductImageSub3: image.ProductImageSub3 || '',
      currentPrice: currentPrice,
      originalPrice: product.ProductPrice || 0,
      stockStatus: stockStatus,
      isOnSale: isOnSale,
      discountPercentage: discountPercentage
    };

    const reviewsAgg = await reviewCollection.aggregate([
      { $match: { ProductID: product.ProductID } },
      { $sort: { DatePosted: -1 } },
      {
        $project: {
          _id: 0,
          CustomerID: 1,
          Rating: { $min: [{ $max: ["$Rating", 0] }, 5] },
          Content: 1,
          DatePosted: {
            $cond: {
              if: { $eq: [{ $type: "$DatePosted" }, "string"] },
              then: {
                $let: {
                  vars: { convertedDate: { $toDate: "$DatePosted" } },
                  in: {
                    $cond: {
                      if: { $eq: [{ $type: "$$convertedDate" }, "date"] },
                      then: { $dateToString: { format: "%d/%m/%Y", date: "$$convertedDate" } },
                      else: "N/A"
                    }
                  }
                }
              },
              else: { $dateToString: { format: "%d/%m/%Y", date: "$DatePosted" } }
            }
          }
        }
      }
    ]).toArray();

    const validReviews = reviewsAgg.filter(r => r.Rating > 0);
    const averageRating = validReviews.length > 0
      ? Number((validReviews.reduce((sum, r) => sum + r.Rating, 0) / validReviews.length).toFixed(1))
      : 0;

    const relatedProducts = await productCollection.find({
      CateID: product.CateID,
      _id: { $ne: productId }
    })
      .limit(4)
      .project({ ProductName: 1, ProductPrice: 1, ProductImageCover: 1, _id: 1 })
      .toArray();

    const relatedProductsWithStringId = relatedProducts.map(p => ({
      ...p,
      _id: p._id.toHexString()
    }));

    res.json({
      ...productWithImages,
      reviews: reviewsAgg,
      averageRating,
      totalReviewCount: validReviews.length,
      relatedProducts: relatedProductsWithStringId
    });
  } catch (err) {
    logger.error('Error fetching product detail', {
      error: err.message,
      stack: err.stack,
      id: req.params.id,
      correlationId: req.correlationId
    });
    res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau.', error: err.message });
  }
});

// ===================== COMPARE API =====================

app.post('/api/compare', authenticateToken, async (req, res) => {
  const { productId } = req.body;
  if (!productId || !ObjectId.isValid(productId)) {
    logger.warn('Invalid productId provided', { productId, correlationId: req.correlationId });
    return res.status(400).json({ error: "Invalid or missing productId" });
  }

  try {
    const productExists = await productCollection.findOne({ _id: new ObjectId(productId) });
    if (!productExists) {
      logger.warn('Product not found for compare', { productId, correlationId: req.correlationId });
      return res.status(404).json({ error: "Product not found" });
    }

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
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/compare', authenticateToken, async (req, res) => {
  try {
    let compareList = [];
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
      compareList = compare ? compare.items : [];
      logger.info('Fetched compare list from MongoDB', { AccountID, compareList, correlationId: req.correlationId });
    } else {
      compareList = req.session.compareList || [];
      logger.info('Fetched compare list from session', { sessionId: req.sessionID, compareList, correlationId: req.correlationId });
    }
    res.json(compareList);
  } catch (err) {
    logger.error('Error in GET /api/compare', { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/compare/all', authenticateToken, async (req, res) => {
  try {
    if (req.isAuthenticated) {
      const AccountID = req.account.AccountID;
      const compareCollection = database.collection('compares');
      await compareCollection.deleteOne({ AccountID });
      req.session.compareList = [];
      logger.info('Cleared compare list in MongoDB and session', { AccountID, correlationId: req.correlationId });
      res.json({ message: "Cleared all compare items", compareList: [] });
    } else {
      req.session.compareList = [];
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      logger.info('Cleared compare list in session', { sessionId: req.sessionID, correlationId: req.correlationId });
      res.json({ message: "Cleared all compare items", compareList: [] });
    }
  } catch (err) {
    logger.error('Error in DELETE /api/compare/all', { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/compare/:productId', authenticateToken, async (req, res) => {
  const productId = req.params.productId;
  if (!productId || !ObjectId.isValid(productId)) {
    logger.warn('Invalid productId provided', { productId, correlationId: req.correlationId });
    return res.status(400).json({ error: "Invalid or missing productId" });
  }

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
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            logger.error('Error saving session in DELETE /api/compare/:productId', { error: err.message, correlationId: req.correlationId });
            reject(err);
          } else {
            logger.info('Removed from compare list in session', { sessionId: req.sessionID, compareList: req.session.compareList, correlationId: req.correlationId });
            resolve();
          }
        });
      });
      res.json({ message: "Removed from compare list", compareList: req.session.compareList });
    }
  } catch (err) {
    logger.error('Error in DELETE /api/compare/:productId', { error: err.message, correlationId: req.correlationId });
    res.status(500).json({ message: 'Internal server error' });
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
      logger.warn('Forgot password attempt with non-existent email', { email, correlationId: reqDeclaringId });
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

// ===================== BLOG NỔI BẬT API ====================

app.get('/api/blogs/random', async (req, res) => {
  try {
    const cateblogId = req.query.cateblogId || 'cateblog1';
    console.log('Request received for random blogs:', req.method, req.url, { cateblogId });

    const pipeline = [
      {
        $lookup: {
          from: 'blogcategories',
          localField: 'categoryID',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $match: { 'category.CateblogID': cateblogId } },
      { $sample: { size: 2 } },
      {
        $project: {
          id: '$_id',
          _id: 0,
          title: '$BlogTitle',
          image: '$BlogImage',
          summary: { $substr: ['$BlogContent', 0, 150] },
          categoryName: '$category.CateblogName'
        }
      }
    ];

    const blogs = await blogCollection.aggregate(pipeline).toArray();
    console.log('Random blogs result:', blogs);

    if (!blogs.length) {
      console.log('No blogs found for category:', cateblogId);
      return res.status(200).json([]);
    }

    res.status(200).json(blogs);
  } catch (err) {
    console.error('Error fetching random blogs:', err.stack);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blogId = req.params.id;
    console.log('Request received for blog detail:', req.method, req.url, { blogId });

    const blog = await blogCollection.findOne({ _id: new ObjectId(blogId) });
    if (!blog) {
      console.log('Blog not found:', blogId);
      return res.status(404).json({ message: 'Bài viết không tồn tại.' });
    }

    const pipeline = [
      { $match: { _id: new ObjectId(blogId) } },
      {
        $lookup: {
          from: 'blogcategories',
          localField: 'categoryID',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: '$_id',
          _id: 0,
          title: '$BlogTitle',
          image: '$BlogImage',
          content: '$BlogContent',
          categoryName: '$category.CateblogName',
          datePosted: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        }
      }
    ];

    const detailedBlog = await blogCollection.aggregate(pipeline).toArray();
    console.log('Blog detail result:', detailedBlog);

    res.status(200).json(detailedBlog[0]);
  } catch (err) {
    console.error('Error fetching blog detail:', err.stack);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});
//=============TUVY-APP.JS=================

// API cho Categories
app.post('/categories', async (req, res) => {
  try {
    const { CateblogID, CateblogName } = req.body;
    const category = { CateblogID, CateblogName };
    const result = await blogCategoryCollection.insertOne(category);
    res.status(201).json({ ...category, _id: result.insertedId });
  } catch (error) {
    logger.error('Error in POST /categories', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const categories = await blogCategoryCollection.find({}).toArray();
    res.json(categories);
  } catch (error) {
    logger.error('Error in GET /categories', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

app.get('/categories/:id', async (req, res) => {
  try {
    const category = await blogCategoryCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.json(category);
  } catch (error) {
    logger.error('Error in GET /categories/:id', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

app.put('/categories/:id', async (req, res) => {
  try {
    const { CateblogID, CateblogName } = req.body;
    const result = await blogCategoryCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { CateblogID, CateblogName } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    const updatedCategory = await blogCategoryCollection.findOne({ _id: new ObjectId(req.params.id) });
    res.json(updatedCategory);
  } catch (error) {
    logger.error('Error in PUT /categories/:id', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

app.delete('/categories/:id', async (req, res) => {
  try {
    const result = await blogCategoryCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.json({ message: "Đã xóa danh mục" });
  } catch (error) {
    logger.error('Error in DELETE /categories/:id', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

// API cho Blogs
app.post('/blogs', async (req, res) => {
  try {
    const { BlogTitle, BlogContent, categoryID, BlogImage } = req.body;
    const blog = {
      BlogTitle,
      BlogContent,
      categoryID: categoryID ? new ObjectId(categoryID) : null, // Chuyển thành ObjectId nếu có
      BlogImage,
    };
    const result = await blogCollection.insertOne(blog);
    res.status(201).json({ ...blog, _id: result.insertedId });
  } catch (error) {
    logger.error('Error in POST /blogs', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

app.get('/blogs/:id', async (req, res) => {
  try {
    const blog = await blogCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
    const category = blog.categoryID 
      ? await blogCategoryCollection.findOne({ _id: new ObjectId(blog.categoryID) }) 
      : null;
    res.json({
      ...blog,
      categoryName: category ? category.CateblogName : "Unknown"
    });
  } catch (error) {
    logger.error('Error in GET /blogs/:id', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

app.get('/blogs', async (req, res) => {
  try {
    const blogs = await blogCollection.find({}).toArray();
    const categoryIds = [...new Set(blogs.map(b => b.categoryID).filter(id => id))]; // Lấy danh sách categoryID duy nhất
    const categories = await blogCategoryCollection.find({ _id: { $in: categoryIds.map(id => new ObjectId(id)) } }).toArray();
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat._id.toString()] = cat.CateblogName;
      return acc;
    }, {});
    const blogsWithCategories = blogs.map(blog => ({
      ...blog,
      categoryName: blog.categoryID ? categoryMap[blog.categoryID] || "Unknown" : "Unknown" // Chỉ lấy một categoryName
    }));
    res.json(blogsWithCategories);
  } catch (error) {
    logger.error('Error in GET /blogs', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

app.put('/blogs/:id', async (req, res) => {
  try {
    const { BlogTitle, BlogContent, categoryID, BlogImage } = req.body;
    const result = await blogCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { 
          BlogTitle, 
          BlogContent, 
          categoryID: categoryID ? new ObjectId(categoryID) : null, 
          BlogImage 
        } 
      }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
    const updatedBlog = await blogCollection.findOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Cập nhật thành công", blog: updatedBlog });
  } catch (error) {
    logger.error('Error in PUT /blogs/:id', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

app.delete('/blogs/:id', async (req, res) => {
  try {
    const result = await blogCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
    res.json({ message: "Đã xóa bài viết" });
  } catch (error) {
    logger.error('Error in DELETE /blogs/:id', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

app.get('/blogs/category/:categoryID', async (req, res) => {
  try {
    const categoryID = new ObjectId(req.params.categoryID);
    const blogs = await blogCollection.find({ categoryID }).sort({ _id: -1 }).toArray();
    if (!blogs.length) {
      return res.status(404).json({ message: "Không tìm thấy bài viết nào thuộc danh mục này" });
    }
    const category = await blogCategoryCollection.findOne({ _id: categoryID });
    const blogsWithCategory = blogs.map(blog => ({
      ...blog,
      categoryName: category ? category.CateblogName : "Unknown"
    }));
    res.json(blogsWithCategory);
  } catch (error) {
    logger.error('Error in GET /blogs/category/:categoryID', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

app.get('/blogs/category/:categoryID/paginated', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const categoryID = new ObjectId(req.params.categoryID);
    const skip = (page - 1) * limit;
    const blogs = await blogCollection.find({ categoryID })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    const totalBlogs = await blogCollection.countDocuments({ categoryID });
    const category = await blogCategoryCollection.findOne({ _id: categoryID });
    const blogsWithCategory = blogs.map(blog => ({
      ...blog,
      categoryName: category ? category.CateblogName : "Unknown"
    }));
    res.json({
      blogs: blogsWithCategory,
      totalBlogs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalBlogs / limit)
    });
  } catch (error) {
    logger.error('Error in GET /blogs/category/:categoryID/paginated', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

app.get('/blogs/category/:categoryID/search', async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const categoryID = new ObjectId(req.params.categoryID);
    const blogs = await blogCollection.find({
      categoryID,
      $or: [
        { BlogTitle: { $regex: searchTerm, $options: 'i' } },
        { BlogContent: { $regex: searchTerm, $options: 'i' } }
      ]
    }).sort({ _id: -1 }).toArray();
    if (!blogs.length) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết nào phù hợp' });
    }
    const category = await blogCategoryCollection.findOne({ _id: categoryID });
    const blogsWithCategory = blogs.map(blog => ({
      ...blog,
      categoryName: category ? category.CateblogName : "Unknown"
    }));
    res.json(blogsWithCategory);
  } catch (error) {
    logger.error('Error in GET /blogs/category/:categoryID/search', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

// API cho FAQs
app.post('/faqs', async (req, res) => {
  try {
    const { FaqID, FaqTitle, FaqContent } = req.body;
    const faq = { FaqID, FaqTitle, FaqContent };
    const result = await faqCollection.insertOne(faq);
    res.status(201).json({ ...faq, _id: result.insertedId });
  } catch (error) {
    logger.error('Error in POST /faqs', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

app.get('/faqs/:id', async (req, res) => {
  try {
    const faq = await faqCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!faq) {
      return res.status(404).json({ message: "Không tìm thấy FAQ" });
    }
    res.json(faq);
  } catch (error) {
    logger.error('Error in GET /faqs/:id', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

app.get('/faqs', async (req, res) => {
  try {
    const faqs = await faqCollection.find({}).toArray();
    res.json(faqs);
  } catch (error) {
    logger.error('Error in GET /faqs', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

app.put('/faqs/:id', async (req, res) => {
  try {
    const { FaqID, FaqTitle, FaqContent } = req.body;
    const result = await faqCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { FaqID, FaqTitle, FaqContent } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy FAQ" });
    }
    const updatedFaq = await faqCollection.findOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Cập nhật thành công", faq: updatedFaq });
  } catch (error) {
    logger.error('Error in PUT /faqs/:id', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

app.delete('/faqs/:id', async (req, res) => {
  try {
    const result = await faqCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy FAQ" });
    }
    res.json({ message: "Đã xóa FAQ" });
  } catch (error) {
    logger.error('Error in DELETE /faqs/:id', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: error.message });
  }
});

// API cho Customers
app.get('/customers', async (req, res) => {
  try {
    const customers = await customerCollection.find({}).toArray();
    res.json(customers);
  } catch (error) {
    logger.error('Error in GET /customers', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: "Lỗi khi lấy danh sách khách hàng" });
  }
});

app.get('/customers/:id', async (req, res) => {
  try {
    const customer = await customerCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    res.json(customer);
  } catch (error) {
    logger.error('Error in GET /customers/:id', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: "Lỗi khi truy vấn khách hàng" });
  }
});

app.post('/customers', async (req, res) => {
  try {
    const { CustomerName, CustomerPhone } = req.body;
    if (!CustomerName || !CustomerPhone) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    const result = await customerCollection.insertOne(req.body);
    res.status(201).json({ message: "Thêm khách hàng thành công", _id: result.insertedId });
  } catch (error) {
    logger.error('Error in POST /customers', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: "Lỗi khi thêm khách hàng" });
  }
});

app.put('/customers/:id', async (req, res) => {
  try {
    const result = await customerCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng để cập nhật" });
    }
    const updatedCustomer = await customerCollection.findOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Cập nhật thành công", customer: updatedCustomer });
  } catch (error) {
    logger.error('Error in PUT /customers/:id', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: "Lỗi khi cập nhật khách hàng" });
  }
});

app.delete('/customers/:id', async (req, res) => {
  try {
    const result = await customerCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng để xóa" });
    }
    res.json({ message: "Xóa khách hàng thành công" });
  } catch (error) {
    logger.error('Error in DELETE /customers/:id', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: "Lỗi khi xóa khách hàng" });
  }
});

// API cho Memberships
app.get('/memberships', async (req, res) => {
  try {
    const memberships = await membershipCollection.find({}).toArray();
    res.json(memberships);
  } catch (error) {
    logger.error('Error in GET /memberships', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ message: "Lỗi khi lấy danh sách memberships" });
  }
});

app.get('/memberships/:id', async (req, res) => {
  try {
    const membership = await membershipCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!membership) {
      return res.status(404).json({ message: "Membership không tồn tại" });
    }
    res.json(membership);
  } catch (error) {
    logger.error('Error in GET /memberships/:id', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ message: "Lỗi khi lấy membership" });
  }
});

app.post('/memberships', async (req, res) => {
  try {
    const { MemberType, MemberID } = req.body;
    const result = await membershipCollection.insertOne({ MemberType, MemberID });
    res.status(201).json({ _id: result.insertedId, MemberType, MemberID });
  } catch (error) {
    logger.error('Error in POST /memberships', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ message: "Lỗi khi thêm membership" });
  }
});

app.put('/memberships/:id', async (req, res) => {
  try {
    const { MemberType, MemberID } = req.body;
    const result = await membershipCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { MemberType, MemberID } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Membership không tồn tại" });
    }
    const updatedMembership = await membershipCollection.findOne({ _id: new ObjectId(req.params.id) });
    res.json(updatedMembership);
  } catch (error) {
    logger.error('Error in PUT /memberships/:id', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ message: "Lỗi khi cập nhật membership" });
  }
});

app.delete('/memberships/:id', async (req, res) => {
  try {
    const result = await membershipCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Membership không tồn tại" });
    }
    res.json({ message: "Xóa membership thành công" });
  } catch (error) {
    logger.error('Error in DELETE /memberships/:id', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ message: "Lỗi khi xóa membership" });
  }
});

// API cho Orders
app.get('/orders/customer/:customerID', async (req, res) => {
  try {
    const customerID = req.params.customerID;
    const orders = await orderCollection.find({ CustomerID: customerID }).toArray();
    if (!orders.length) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng nào cho khách hàng này." });
    }
    res.json(orders);
  } catch (error) {
    logger.error('Error in GET /orders/customer/:customerID', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: "Lỗi khi lấy lịch sử đơn hàng" });
  }
});

// WebSocket và Message Handling
const { Server } = require('socket.io');
const server = require('http').createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4200", "http://localhost:4002"],
    methods: ["GET", "POST"],
  },
});

const clients = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("register", (userName) => {
    clients.set(userName, socket.id);
    logger.info(`User ${userName} registered with socket ID: ${socket.id}`, { correlationId: 'socket' });
  });

  socket.on("sendMessage", async (data) => {
    console.log("📥 Tin nhắn nhận được:", data);
    if (!data.targetUser) {
      logger.warn("Thiếu targetUser trong dữ liệu gửi đến server", { correlationId: 'socket' });
      return;
    }

    const newMessage = {
      user: data.user,
      message: data.message,
      targetUser: data.targetUser,
      timestamp: new Date(),
    };
    await messageCollection.insertOne(newMessage);
    logger.info("Đã lưu tin nhắn vào MongoDB", { message: newMessage, correlationId: 'socket' });

    const targetSocketId = clients.get(data.targetUser);
    if (targetSocketId) {
      io.to(targetSocketId).emit("receiveMessage", {
        user: data.user,
        message: data.message,
        targetUser: data.targetUser,
      });
      logger.info(`Đã gửi tin nhắn đến ${data.targetUser} (socket ID: ${targetSocketId})`, { correlationId: 'socket' });
    } else {
      logger.warn(`Không tìm thấy socket ID cho người dùng: ${data.targetUser}`, { correlationId: 'socket' });
    }
  });

  socket.on("disconnect", () => {
    for (const [userName, socketId] of clients.entries()) {
      if (socketId === socket.id) {
        clients.delete(userName);
        logger.info(`User ${userName} disconnected`, { correlationId: 'socket' });
        break;
      }
    }
  });
});

app.get("/messages", async (req, res) => {
  try {
    const messages = await messageCollection.find({}).sort({ timestamp: 1 }).toArray();
    res.json(messages);
  } catch (error) {
    logger.error('Error in GET /messages', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ error: "Lỗi khi lấy tin nhắn" });
  }
});

//=================================FEEDBACKS API=================================//
// API lấy danh sách feedback gộp thông tin
app.get('/api/feedbacks', async (req, res) => {
  try {
    // Lấy tất cả reviews
    const reviews = await reviewCollection.find().toArray();

    // Gộp dữ liệu từ products và customers
    const feedbacks = await Promise.all(
      reviews.map(async (review) => {
        // Tìm product liên quan dựa trên ProductID
        const product = await productCollection.findOne({ ProductID: review.ProductID });
        // Tìm customer liên quan dựa trên CustomerID
        const customer = await customerCollection.findOne({ CustomerID: review.CustomerID });

        return {
          reviewID: review.ReviewID,
          productName: product ? product.ProductName : 'Unknown Product',
          customerName: customer ? customer.CustomerName : 'Unknown Customer',
          customerAvatar: customer ? customer.CustomerAvatar || 'https://dummyjson.com/icon/default/128' : 'https://dummyjson.com/icon/default/128', // Ảnh mặc định nếu không có
          content: review.Content,
          rating: review.Rating,
          datePosted: review.DatePosted,
        };
      })
    );

    logger.info('Fetched feedbacks successfully', { count: feedbacks.length, correlationId: req.correlationId });
    res.status(200).json(feedbacks);
  } catch (error) {
    logger.error('Error fetching feedbacks', { error: error.message, correlationId: req.correlationId });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//=====anhthucode
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

app.post('/api/reviews', async (req, res) => {
  try {
    const { ProductID, CustomerID, Content, Rating, DatePosted, Images } = req.body;

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



// Khởi động server sau khi kết nối MongoDB
async function startServer() {
  await connectDB();
  server.listen(port, () => {
    logger.info(`Server running on port ${port}`, { correlationId: 'system' });
  });
}

startServer().catch(err => {
  logger.error('Failed to start server', { error: err.message, correlationId: 'system' });
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await client.close();
  logger.info('MongoDB connection closed', { correlationId: 'system' });
  process.exit(0);
});


