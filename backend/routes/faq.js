const express = require('express');
const router = express.Router();
const Faq = require('../db/faq');
const { addFaq,
    updateFaq,
    deleteFaq,
    getFaq,
    getAllFaqs } = require('../handlers/faq-handler');
router.post("", async (req, res) => {
    let model = req.body;
    let faq = await addFaq(model);
    res.send(faq);
});

router.get("/:id", async (req, res) => {
    let id = req.params["id"];
    let faq = await getFaq(id);
    res.send(faq);
});

router.get("/", async (req, res) => {
    let faqs = await getAllFaqs();
    res.send(faqs);
});

router.put("/:id", async (req, res) => {
    let model = req.body;
    let id = req.params["id"];
    await updateFaq(id, model);
    res.send({message: "updated"});
});

router.delete("/:id", async (req, res) => {
    let id = req.params["id"];
    await deleteFaq(id);
    res.send({message: "deleted"});
});

module.exports = router;