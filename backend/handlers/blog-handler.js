const Blog = require('../db/blog');

async function addBlog(model){
    let blog = new Blog({
        ...model,
    });
    await blog.save();
    return blog.toObject();
}

async function updateBlog(id, model){
    await Blog.findByIdAndUpdate(id, model);
}

async function deleteBlog(id){
    await Blog.findByIdAndDelete(id);
}

async function getBlog(id){
    let blog = await Blog.findById(id);
    return blog.toObject(); 
}

async function getAllBlogs(){
    let blogs = await Blog.find();
    return blogs.map((x) => x.toObject());
}

module.exports = {
    addBlog,
    updateBlog,
    deleteBlog,
    getBlog,
    getAllBlogs
}