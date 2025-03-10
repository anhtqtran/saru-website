// const Category = require('../db/category');

// async function addCategory(model) {
//     let category = new Category({
//         name: model.name,
//     });
//     await category.save();
//     return category.toObject();
// }
// async function getCategories() {
//     let categories = await Category.find({});
//     return categories.map((c) => c.toObject());
// }
// async function updateCategory(id, model) {
//     await Category.findByIdAndUpdate(id, { name: model.name });  // Cập nhật trường name
//     return { message: "ok" };
// }
// async function deleteCategory(id) {
//     await Category.findByIdAndDelete(id);
//     return { message: "ok" };
// }
// module.exports = { addCategory, updateCategory, deleteCategory, getCategories };