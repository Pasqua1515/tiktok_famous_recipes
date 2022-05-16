const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const dishController = require("../controllers/dishController");

//create dish
router.post("/uploadDish", dishController.upload, dishController.uploadDish);

//add ingredients
router.patch("/addIngredients", dishController.addIngredients);

//get all dishes
router.get("/all", dishController.getAllDishes);

// find one dish by dish ID
router.get("/findDish/:id", dishController.findDish);

module.exports = router;
