const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const userController = require("../controllers/userController");

// user saves dishes
router.post(
  "/user/:dishId",
  auth,
  userController.upload,
  userController.saveDish
);

//get all my saved dishes
router.get("/saved", auth, userController.getMySavedDishes);

//get one saved dish
router.get("/saved/:dishId", auth, userController.getOneSavedDish);

//unsave dish
router.delete("/saved/:dishId", auth, userController.unsaveDish);

module.exports = router;
