const mongoose = require('mongoose');
const { Schema } = mongoose;
const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    categoryID: [{
        type: Schema.Types.ObjectId,
        ref: 'categories'
    }],
    image: Array(String),
})
const Blog = mongoose.model('blogs', blogSchema);
module.exports = Blog;