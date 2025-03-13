const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = 4002;

app.use(express.json());
app.use(cors({ origin: '*' }));

const uri = "mongodb+srv://user1:ry3l1jwj1IJlM1fT@database.nkts1.mongodb.net/?";
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB successfully!");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
  }
}

const database = client.db("SaruData");
const promotionsCollection = database.collection("promotions");
const vouchersCollection = database.collection("Vouchers");
const promotionStatusesCollection = database.collection("promotionstatuses");
const voucherStatusesCollection = database.collection("VoucherConditions");
const ordersCollection = database.collection("orders");
const categoriesCollection = database.collection("categories");

connectToDatabase();

// GET /promotions (Lấy tất cả promotions)
app.get("/promotions", cors(), async (req, res) => {
  try {
    const promotions = await promotionsCollection.find({}).toArray();
    res.status(200).json(promotions);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách promotions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /promotions/:id
app.get("/promotions/:id", cors(), async (req, res) => {
  try {
    const o_id = new ObjectId(req.params["id"]);
    const promotion = await promotionsCollection.findOne({ _id: o_id });
    if (promotion) {
      res.status(200).json(promotion);
    } else {
      res.status(404).json({ message: "Promotion not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /vouchers (Lấy tất cả vouchers)
app.get("/vouchers", cors(), async (req, res) => {
  try {
    const vouchers = await vouchersCollection.find({}).toArray();
    res.status(200).json(vouchers);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách vouchers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /vouchers/:id
app.get("/vouchers/:id", cors(), async (req, res) => {
  try {
    const o_id = new ObjectId(req.params["id"]);
    const voucher = await vouchersCollection.findOne({ _id: o_id });
    if (voucher) {
      const usedCount = await ordersCollection.countDocuments({ VoucherID: voucher.VoucherID });
      res.status(200).json({
        ...voucher,
        UsedCount: usedCount,
        RemainingQuantity: voucher.VoucherQuantity - usedCount,
      });
    } else {
      res.status(404).json({ message: "Voucher not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Đảm bảo endpoint /combined-data được định nghĩa
app.get("/combined-data", cors(), async (req, res) => {
  try {
    const promotions = await promotionsCollection.find({}).toArray();
    const vouchers = await vouchersCollection.find({}).toArray();
    const promotionStatuses = await promotionStatusesCollection.find({}).toArray();
    const voucherStatuses = await voucherStatusesCollection.find({}).toArray();
    const categories = await categoriesCollection.find({}).toArray();

    const vouchersWithUsage = await Promise.all(vouchers.map(async (voucher) => {
      const usedCount = await ordersCollection.countDocuments({ VoucherID: voucher.VoucherID });
      return {
        ...voucher,
        UsedCount: usedCount,
        RemainingQuantity: voucher.VoucherQuantity - usedCount
      };
    }));

    const combinedItems = [
      ...promotions.map(p => ({ ...p, type: 'promotion' })),
      ...vouchersWithUsage.map(v => ({ ...v, type: 'voucher' }))
    ].sort((a, b) => {
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
      categories: categories,
      total: {
        promotions: combinedItems.filter(item => item.type === 'promotion').length,
        vouchers: combinedItems.filter(item => item.type === 'voucher').length
      }
    };

    res.status(200).json(combinedData);
  } catch (error) {
    console.error("❌ Lỗi khi xử lý /combined-data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/promotions/:id", cors(), async (req, res) => {
  try {
    var o_id = new ObjectId(req.params["id"]);
    const result = await promotionsCollection.deleteOne({ _id: o_id });
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Promotion deleted successfully" });
    } else {
      res.status(404).json({ message: "Promotion not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

app.delete("/vouchers/:id", cors(), async (req, res) => {
  try {
    var o_id = new ObjectId(req.params["id"]);
    const result = await vouchersCollection.deleteOne({ _id: o_id });
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Voucher deleted successfully" });
    } else {
      res.status(404).json({ message: "Voucher not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/promotions/:id/end", cors(), async (req, res) => {
  try {
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
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/vouchers/:id/end", cors(), async (req, res) => {
  try {
    const o_id = new ObjectId(req.params["id"]);
    const today = new Date().toISOString();
    const result = await vouchersCollection.updateOne(
      { _id: o_id },
      { $set: { VoucherExpiredDate: today } }
    );
    if (result.matchedCount === 1) {
      res.status(200).json({ message: "Voucher ended successfully" });
    } else {
      res.status(404).json({ message: "Voucher not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/promotions/:id", cors(), async (req, res) => {
  try {
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
        ApplicableScope: updateData.ApplicableScope
      }}
    );
    if (result.matchedCount === 1) {
      res.status(200).json({ message: "Promotion updated successfully" });
    } else {
      res.status(404).json({ message: "Promotion not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/vouchers/:id", cors(), async (req, res) => {
  try {
    const o_id = new ObjectId(req.params["id"]);
    const updateData = req.body;
    const result = await vouchersCollection.updateOne(
      { _id: o_id },
      { $set: {
        VoucherID: updateData.VoucherID,
        VoucherStartDate: updateData.VoucherStartDate,
        VoucherExpiredDate: updateData.VoucherExpiredDate,
        VoucherConditionID: updateData.VoucherConditionID,
        VoucherQuantity: updateData.VoucherQuantity,
        VoucherValue: updateData.VoucherValue,
        RemainingQuantity: updateData.RemainingQuantity,
        ApplicableScope: updateData.ApplicableScope
      }}
    );
    if (result.matchedCount === 1) {
      res.status(200).json({ message: "Voucher updated successfully" });
    } else {
      res.status(404).json({ message: "Voucher not found" });
    }

// POST /promotions
app.post("/promotions", cors(), async (req, res) => {
  try {
    const newPromotion = req.body;
    const result = await promotionsCollection.insertOne(newPromotion);
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
    const result = await vouchersCollection.insertOne(newVoucher);
    res.status(201).json({ message: "Voucher created successfully", id: result.insertedId });
  } catch (error) {
    console.error("❌ Lỗi khi tạo mới voucher:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});