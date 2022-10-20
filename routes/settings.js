const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");

router.route("/add-category").post(settingsController.addCategory);

router.route("/get-categories").get(settingsController.getAllCategories);

router.route("/delete-category").post(settingsController.deleteCategory);


module.exports = router;