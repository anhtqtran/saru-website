const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function updatePasswords() {
  try {
    await client.connect();
    const database = client.db('SaruData');
    const accountCollection = database.collection('accounts');

    // Tìm tất cả tài khoản có mật khẩu plaintext
    const accounts = await accountCollection.find({}).toArray();

    for (const account of accounts) {
      // Kiểm tra xem mật khẩu có phải plaintext không (giả sử plaintext không bắt đầu bằng $2a$)
      if (!account.CustomerPassword.startsWith('$2a$')) {
        const plaintextPassword = account.CustomerPassword;
        const hashedPassword = await bcrypt.hash(plaintextPassword, 10);

        // Cập nhật mật khẩu trong MongoDB
        await accountCollection.updateOne(
          { _id: account._id },
          { $set: { CustomerPassword: hashedPassword } }
        );
        console.log(`Updated password for ${account.CustomerEmail}`);
      }
    }
    console.log('All passwords updated successfully!');
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    await client.close();
  }
}

updatePasswords();