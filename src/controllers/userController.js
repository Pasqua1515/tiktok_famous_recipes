const fs = require("fs");
const Dish = require("../models/dishModel");
const upload = require("../middlewares/multer");
const User = require("../models/userModel");
const SavedRecipe = require("../models/savedRecipesModel");
const AppError = require("../errors/appError");
const catchAsync = require("../utils/catchAsync");
const { cloudUpload } = require("../utils/cloudinary");
const { use } = require("../routes/userRoute");

const userController = {};

// multer
userController.upload = upload.array("files", 3);

 //user saves dish
 userController.saveDish = catchAsync(async (req, res, next) => {
     let { dishId } = req.params.dishId;

     // check if dish exist
     const dish = await Dish.findOne({ dishId });
     if (!dish) return next(new AppError("Dish not found", 404));

     //check if user is logged
     let user = await User.findById({ _id: req.USER_ID });
     if (!user) return next(new AppError("User not logged in", 400));

    //update user saved dishes model
    user.savedDishes.push(dish)

     //create new Schema
     const newSavedDish = new SavedRecipe({
     user: user,
     dish:dish
    });

     //save the schema
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
   });

//get all saved dishes
userController.getMySavedDishes = catchAsync(async (req, res, next) => {
    const savedDishes = await SavedRecipe.find({});
    if (!savedDishes) {
      return next(new AppError(`Could not GET all Saved Dishes`, 404));
    }
  
    //send a response
    res.status(200).send({
      status: "status",
      data: savedDishes,
    });
  });

userController.getOneSavedDish = catchAsync(async (req, res, next) => {});

userController.unsaveDish = catchAsync(async (req, res, next) => {});

module.exports = userController;
