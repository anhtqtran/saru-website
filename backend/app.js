const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

app.use(express.json());
app.use(cors())

// Kết nối MongoDB
mongoose.connect('mongodb+srv://user1:ry3l1jwj1IJlM1fT@database.nkts1.mongodb.net/SaruData?retryWrites=true&w=majority&appName=Database', {
    dbName: 'SaruData',
}).then(() => {
    console.log("Connected to MongoDB successfully");
}).catch(err => {
    console.error("Error connecting to MongoDB:", err);
});

const categorySchema = new mongoose.Schema({
    CateblogID: String,
    CateblogName: String,
});
const Category = mongoose.model('blogcategories', categorySchema);

const blogSchema = new mongoose.Schema({
    BlogID: String,
    BlogTitle: String,
    BlogContent: String,
    categoryID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blogcategories'
    }],
    BlogImage: [String],
});
const Blog = mongoose.model('blogs', blogSchema);

const faqSchema = new mongoose.Schema({
    FaqID: String,
    FaqTitle: String,
    FaqContent: String,
});
const Faq = mongoose.model('faqs', faqSchema);

// Thêm danh mục
app.post('/categories', async (req, res) => {
    try {
        let category = new Category({
        CateblogID: req.body.CateblogID,
        CateblogName: req.body.CateblogName,
        });
        await category.save();
        res.send(category.toObject());
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Lấy danh sách danh mục
app.get('/categories', async (req, res) => {
    try {
        let categories = await Category.find({});
        res.send(categories.map((c) => c.toObject()));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Cập nhật danh mục
app.put('/categories/:id', async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,  // Sử dụng _id từ URL
            { CateblogID: req.body.CateblogID, CateblogName: req.body.CateblogName },
            { new: true } // Trả về dữ liệu sau khi cập nhật
        );

        if (!updatedCategory) {
            return res.status(404).send({ message: "Không tìm thấy danh mục" });
        }
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.get('/categories/:id', async (req, res) => {
    try {
        let category = await Category.findById(req.params.id); // Sửa đúng tên model
        if (!category) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }
        res.send(category.toObject());
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Xóa danh mục
app.delete('/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.send({ message: "deleted" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Thêm blog
app.post('/blogs', async (req, res) => {
    try {
        console.log("Dữ liệu nhận từ Frontend:", req.body); // ✅ Log dữ liệu nhận từ Angular

        let blog = new Blog({
            BlogTitle: req.body.BlogTitle,
            BlogContent: req.body.BlogContent,
            categoryID: req.body.categoryID.map(id => new mongoose.Types.ObjectId(id)),
            BlogImage: req.body.BlogImage
        });

        await blog.save();
        res.send(blog.toObject());
    } catch (error) {
        console.error("Lỗi khi thêm Blog:", error); // ✅ Log lỗi Backend
        res.status(500).send({ error: error.message });
    }
});


// Lấy blog theo ID
app.get('/blogs/:id', async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id).populate('categoryID'); // Lấy danh mục đầy đủ
        if (!blog) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lấy tất cả blog
app.get('/blogs', async (req, res) => {
    try {
        let blogs = await Blog.find().populate('categoryID'); // Lấy danh mục theo ObjectId
        res.json(blogs);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Cập nhật blog
app.put('/blogs/:id', async (req, res) => {
    try {
        await Blog.findByIdAndUpdate(req.params.id, req.body);
        res.send({ message: "updated" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Xóa blog
app.delete('/blogs/:id', async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.send({ message: "deleted" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Thêm blog
app.post('/blogs', async (req, res) => {
    try {
        let blog = new Blog({
            ...req.body,
        });
        await blog.save();
        res.send(blog.toObject());
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Lấy blog theo ID
app.get('/blogs/:id', async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id)
                             .populate('categoryID', 'CateblogName'); // Populate để lấy tên danh mục

        if (!blog) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }

        res.json(blog); // Trả về blog với danh mục đầy đủ
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lấy tất cả blog
app.get('/blogs', async (req, res) => {
    try {
        let blogs = await Blog.find();
        res.send(blogs.map((x) => x.toObject()));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Cập nhật blog
app.put('/blogs/:id', async (req, res) => {
    try {
        await Blog.findByIdAndUpdate(req.params.id, req.body);
        res.send({ message: "updated" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.get('/blogs/category/:categoryID', async (req, res) => {
    try {
        const categoryID = req.params.categoryID;

        if (!mongoose.Types.ObjectId.isValid(categoryID)) {
            return res.status(400).json({ error: 'Category ID không hợp lệ' });
        }

        const blogs = await Blog.find({ categoryID })
            .populate('categoryID', 'CateblogName') // Lấy tên danh mục
            .sort({ _id: -1 }); // Sắp xếp theo thời gian mới nhất

        if (!blogs.length) {
            return res.status(404).json({ message: "Không tìm thấy bài viết nào thuộc danh mục này" });
        }

        res.json(blogs);
    } catch (error) {
        console.error('Lỗi khi lấy blog theo danh mục:', error);
        res.status(500).json({ error: error.message });
    }
});

// API lấy danh sách bài viết theo categoryID với phân trang (tùy chọn)
app.get('/blogs/category/:categoryID/paginated', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Mặc định: trang 1, 10 bài/trang
        const categoryID = req.params.categoryID;

        if (!categoryID) {
            return res.status(400).json({ error: 'Category ID không hợp lệ' });
        }

        const blogs = await Blog.find({ 'categoryID': categoryID })
            .populate('categoryID', 'CateblogName')
            .skip((page - 1) * limit) // Bỏ qua số bài của các trang trước
            .limit(parseInt(limit)) // Giới hạn số bài mỗi trang
            .sort({ _id: -1 }); // Sắp xếp theo thứ tự mới nhất

        const totalBlogs = await Blog.countDocuments({ 'categoryID': categoryID });

        res.json({
            blogs,
            totalBlogs,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalBlogs / limit)
        });
    } catch (error) {
        console.error('Error retrieving paginated blogs:', error);
        res.status(500).json({ error: error.message });
    }
});

// API tìm kiếm bài viết trong danh mục (tùy chọn)
app.get('/blogs/category/:categoryID/search', async (req, res) => {
    try {
        const { searchTerm } = req.query;
        const categoryID = req.params.categoryID;

        if (!categoryID) {
            return res.status(400).json({ error: 'Category ID không hợp lệ' });
        }

        const query = {
            'categoryID': categoryID,
            $or: [
                { BlogTitle: { $regex: searchTerm, $options: 'i' } }, // Tìm kiếm không phân biệt hoa thường
                { BlogContent: { $regex: searchTerm, $options: 'i' } }
            ]
        };

        const blogs = await Blog.find(query)
            .populate('categoryID', 'CateblogName')
            .sort({ _id: -1 });

        if (blogs.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết nào phù hợp' });
        }

        res.json(blogs);
    } catch (error) {
        console.error('Error searching blogs:', error);
        res.status(500).json({ error: error.message });
    }
});

// Xóa blog
app.delete('/blogs/:id', async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.send({ message: "deleted" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Thêm FAQ
app.post('/faqs', async (req, res) => {
    try {
        let faq = new Faq({
            ...req.body,
        });
        await faq.save();
        res.send(faq.toObject());
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Lấy FAQ theo ID
app.get('/faqs/:id', async (req, res) => {
    try {
        let faq = await Faq.findById(req.params.id);
        res.send(faq.toObject());
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Lấy tất cả FAQs
app.get('/faqs', async (req, res) => {
    try {
        let faqs = await Faq.find();
        res.send(faqs.map((x) => x.toObject()));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Cập nhật FAQ
app.put('/faqs/:id', async (req, res) => {
    try {
        await Faq.findByIdAndUpdate(req.params.id, req.body);
        res.send({ message: "updated" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Xóa FAQ
app.delete('/faqs/:id', async (req, res) => {
    try {
        await Faq.findByIdAndDelete(req.params.id);
        res.send({ message: "deleted" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Schema Customers
const customerSchema = new mongoose.Schema({
    CustomerID: String,
    CustomerName: String,
    MemberID: String,
    CustomerAdd: String, // Địa chỉ lưu dưới dạng string
    CustomerPhone: String,
    CustomerBirth: String,
    CustomerAvatar: String,
    ReceiveEmail: Boolean,
});
const Customer = mongoose.model('customers', customerSchema);

// Lấy danh sách tất cả khách hàng
app.get('/customers', async (req, res) => {
    try {
        const customers = await Customer.find({});
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách khách hàng" });
    }
});

// Lấy thông tin khách hàng theo ID
app.get('/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: "Không tìm thấy khách hàng" });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi truy vấn khách hàng", details: error.message });
    }
});

// Thêm khách hàng mới
app.post('/customers', async (req, res) => {
    try {
        const newCustomer = req.body;
        if (!newCustomer.CustomerName || !newCustomer.CustomerPhone) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
        }
        const result = await Customer.create(newCustomer);
        res.json({ message: "Thêm khách hàng thành công", _id: result._id });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi thêm khách hàng" });
    }
});

// Cập nhật thông tin khách hàng theo ID
app.put('/customers/:id', async (req, res) => {
    try {
        const updateData = req.body;
        const result = await Customer.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!result) {
            return res.status(404).json({ message: "Không tìm thấy khách hàng để cập nhật" });
        }
        res.json({ message: "Cập nhật thành công", customer: result });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi cập nhật khách hàng", details: error.message });
    }
});

// Xóa khách hàng theo ID
app.delete('/customers/:id', async (req, res) => {
    try {
        const result = await Customer.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Không tìm thấy khách hàng để xóa" });
        }
        res.json({ message: "Xóa khách hàng thành công" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi xóa khách hàng", details: error.message });
    }
});

// Định nghĩa Schema cho Membership
const membershipSchema = new mongoose.Schema({
  MemberType: String,
  MemberID: String
});

const Membership = mongoose.model('Membership', membershipSchema);

// ✅ API 1: Lấy danh sách tất cả memberships
app.get('/memberships', async (req, res) => {
  try {
    const memberships = await Membership.find();
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách memberships", error });
  }
});

// ✅ API 2: Lấy membership theo ID
app.get('/memberships/:id', async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      return res.status(404).json({ message: "Membership không tồn tại" });
    }
    res.json(membership);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy membership", error });
  }
});

// ✅ API 3: Thêm một membership mới
app.post('/memberships', async (req, res) => {
  try {
    const { MemberType, MemberID } = req.body;
    const newMembership = new Membership({ MemberType, MemberID });
    await newMembership.save();
    res.status(201).json(newMembership);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm membership", error });
  }
});

// ✅ API 4: Cập nhật membership theo ID
app.put('/memberships/:id', async (req, res) => {
  try {
    const { MemberType, MemberID } = req.body;
    const updatedMembership = await Membership.findByIdAndUpdate(
      req.params.id,
      { MemberType, MemberID },
      { new: true }
    );

    if (!updatedMembership) {
      return res.status(404).json({ message: "Membership không tồn tại" });
    }
    res.json(updatedMembership);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật membership", error });
  }
});

// ✅ API 5: Xóa membership theo ID
app.delete('/memberships/:id', async (req, res) => {
  try {
    const deletedMembership = await Membership.findByIdAndDelete(req.params.id);
    if (!deletedMembership) {
      return res.status(404).json({ message: "Membership không tồn tại" });
    }
    res.json({ message: "Xóa membership thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa membership", error });
  }
});

// Schema Orders
const orderSchema = new mongoose.Schema({
    OrderID: String,
    CustomerID: String,
    PaymentMethodID: Number,
    PaymentStatusID: Number,
    VoucherID: String,
    OrderStatusID: Number,
    OrderDate: String,  // Giữ nguyên dạng chuỗi để dễ hiển thị
});
const Order = mongoose.model('orders', orderSchema);

// ✅ API: Lấy đơn hàng theo CustomerID
app.get('/orders/customer/:customerID', async (req, res) => {
    try {
        const customerID = req.params.customerID; // Lấy CustomerID từ URL

        // ✅ Tìm đơn hàng có `CustomerID` trùng khớp
        const orders = await Order.find({ CustomerID: customerID });

        if (!orders.length) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng nào cho khách hàng này." });
        }

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy lịch sử đơn hàng", details: error.message });
    }
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});