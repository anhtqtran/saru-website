const nodemailer = require('nodemailer');

class Mail {
    constructor() {
        this.DESTINATION_EMAIL = process.env.EMAIL_USER;

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendNotificationEmail(userData) {
        try {
            const mailOptions = {
                from: `"Thông báo" <${this.DESTINATION_EMAIL}>`,
                to: this.DESTINATION_EMAIL,
                subject: `Thông báo: Người dùng ${userData.email} đã gửi tin nhắn`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                            .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1); padding: 20px; }
                            .header { background-color: #007bff; color: #ffffff; text-align: center; padding: 15px; font-size: 20px; font-weight: bold; border-top-left-radius: 8px; border-top-right-radius: 8px; }
                            .content { padding: 20px; line-height: 1.6; color: #333333; }
                            .message-box { background-color: #f1f1f1; padding: 15px; border-left: 4px solid #007bff; margin-top: 10px; border-radius: 5px; font-style: italic; }
                            .footer { text-align: center; padding: 10px; font-size: 14px; color: #777777; background-color: #f9f9f9; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
                            .footer a { color: #007bff; text-decoration: none; }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="header">📩 Thông báo mới từ hệ thống</div>
                            <div class="content">
                                <p>Xin chào,</p>
                                <p>Bạn vừa nhận được một tin nhắn từ <b>${userData.email}</b>:</p>
                                <div class="message-box">
                                    ${userData.message}
                                </div>
                                <p>Vui lòng kiểm tra và phản hồi sớm nhất có thể.</p>
                            </div>
                            <div class="footer">
                                © 2024 Công ty của bạn | <a href="mailto:${this.DESTINATION_EMAIL}">Liên hệ hỗ trợ</a>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            };

            console.log('📩 Đang gửi email:', mailOptions);

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email đã được gửi:', info.messageId);
        } catch (error) {
            console.error('❌ Lỗi khi gửi email:', error);
        }
    }
}

module.exports = new Mail();
