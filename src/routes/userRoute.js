const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const userController = require("../controllers/userController");

// user saves dishes
router.post(
  "/save/:dishId",
  auth,
  userController.upload,
  userController.saveDish
);

//get all MY saved dishes
router.get("/allSaved", auth, userController.getMySavedDishes);

//get one saved dish
router.get("/saved/:dishId", auth, userController.getOneSavedDish);

//unsave dish
router.delete("/unsave/:dishId", auth, userController.unsaveDish);

module.exports = router;
