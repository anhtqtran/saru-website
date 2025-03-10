const Faq = require('../db/faq');

async function addFaq(model){
    let faq = new Faq({
        ...model,
    });
    await faq.save();
    return faq.toObject();
}

async function updateFaq(id, model){
    await Faq.findByIdAndUpdate(id, model);
}

async function deleteFaq(id){
    await Faq.findByIdAndDelete(id);
}

async function getFaq(id){
    let faq = await Faq.findById(id);
    return faq.toObject(); 
}

async function getAllFaqs(){
    let faqs = await Faq.find();
    return faqs.map((x) => x.toObject());
}

module.exports = {
    addFaq,
    updateFaq,
    deleteFaq,
    getFaq,
    getAllFaqs
}