const express = require('express');
const router = express.Router();
const Blog = require('../db/blog');
const { addBlog, getBlog, getAllBlogs, updateBlog, deleteBlog } = require('../handlers/blog-handler');
router.post("", async (req, res) => {
    let model = req.body;
    let blog = await addBlog(model);
    res.send(blog);
});

router.get('/:id', async (req, res) => {
    try {
        let blog = await getBlog(req.params.id);
        res.json(blog);
    } catch (error) {
        console.error("Lỗi khi lấy bài viết:", error.message);
        res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
});

router.get("/", async (req, res) => {
    let blogs = await getAllBlogs();
    res.send(blogs);
});

router.put("/:id", async (req, res) => {
    let model = req.body;
    let id = req.params["id"];
    await updateBlog(id, model);
    res.send({message: "updated"});
});

router.delete("/:id", async (req, res) => {
    let id = req.params["id"];
    await deleteBlog(id);
    res.send({message: "deleted"});
});

module.exports = router;