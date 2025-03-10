const mongoose = require('mongoose');
const faqSchema = new mongoose.Schema({
    FaqID: String,
    FaqTitle: String,
    FaqContent: String,
})
const Faq = mongoose.model('faqs', faqSchema);
module.exports = Faq;