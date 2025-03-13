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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});