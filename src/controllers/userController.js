const fs = require("fs");
const Dish = require("../models/dishModel");
const upload = require("../middlewares/multer");
const User = require("../models/userModel");
const SavedRecipe = require("../models/savedRecipesModel");
const AppError = require("../errors/appError");
const catchAsync = require("../utils/catchAsync");
const { cloudUpload } = require("../utils/cloudinary");
const { use } = require("../routes/userRoute");
const { Console } = require("console");

const userController = {};

// multer
userController.upload = upload.array("files", 3);

//user saves dish
userController.saveDish = catchAsync(async (req, res, next) => {
    /// dish Id is TTV-1 not 6281613d3159425cee8f8966
    const dishId = req.params.dishId;

    // check if dish exist
    let dish = await Dish.findOne({ dishId });
    if (!dish) return next(new AppError("Dish not found", 404));
  
    //check if user is logged
    let user = await User.findById({ _id: req.USER_ID });
    if (!user) return next(new AppError("User not logged in", 400));
  
//1. check if schema with user already exists

const userSchemaExists = await SavedRecipe.exists({ user:user
});
if (userSchemaExists){
  const existingUserSChema = await SavedRecipe.findOne({user: req.USER_ID})
 existingUserSChema.pushDish(dish)
  dish.calcSavedDishes();

  dish.save((err, result) => {
    if (err) return next(new AppError({ message: err.message }, 400));
  });

  user.save((err, result) => {
   if (err) return next(new AppError({ message: err.message }, 400));
 });

 existingUserSChema.save((err, result) => {
  if (err) return next(new AppError({ message: err.message }, 400));
  else {
    //send a response
    res.status(201).send({
      status: "success",
      message: "Dish saved successfully",
    });
  }
});

}else{
  
  //create id for frontend use
  let savedDishId;
  const lastSavedDish = await SavedRecipe.find().sort({ _id: -1 }).limit(1);
  if (lastSavedDish.length == 0) {
    savedDishId = "SD-1";
  } else {
    savedDishId =
      "SD-" + `${Number(lastSavedDish[0].savedDishId.split("-")[1]) + 1}`;
  }

  //create new Schema --> essence of this is for the tik tok owner to know how many people saved/liked and want t try out their recipe -- to be reviewed
  const newSavedDish = new SavedRecipe({
    savedDishId: savedDishId,
    user: user,
  });


 user.saveDish(newSavedDish._id)
 user.save((err, result) => {
  if (err) return next(new AppError({ message: err.message }, 400));
});

  //instance method
  newSavedDish.pushDish(dish);
  dish.calcSavedDishes();

  dish.save((err, result) => {
    if (err) return next(new AppError({ message: err.message }, 400));
  });

  // ! populate ---> so we dont just give the id but also the full information
  User.findById({ _id: req.USER_ID }).populate("savedDishes")
  SavedRecipe.findOne({ savedDishId }).populate("savedDishes");
  SavedRecipe.findOne({ savedDishId }).populate("user");

  ///save the saved recipe schema
  newSavedDish.save((err, result) => {
    if (err) return next(new AppError({ message: err.message }, 400));
    else {
      //send a response
      res.status(201).send({
        status: "success",
        message: "Dish saved successfully",
      });
    }
  });
}



});

//get all user saved dishes
userController.getMySavedDishes = catchAsync(async (req, res, next) => {
  //check if user is logged
  let user = await User.findById({ _id: req.USER_ID });
  if (!user) return next(new AppError("User not logged in", 400));

  

  //get saved dishes of user X
  const savedDishes = await SavedRecipe.find({user:req.USER_ID});
  if (!savedDishes) {
    return next(new AppError(`Could not GET all YOUR Saved Dishes`, 404));
  }

console.log(savedDishes)

  //send a response
  res.status(200).send({
    status: "status",
    data: savedDishes ,
  });
});

userController.getOneSavedDish = catchAsync(async (req, res, next) => {});

userController.unsaveDish = catchAsync(async (req, res, next) => {});

module.exports = userController;
