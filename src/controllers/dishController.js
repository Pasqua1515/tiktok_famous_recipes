const fs = require("fs");
const Dish = require("../models/dishModel");
const upload = require("../middlewares/multer");
const AppError = require("../errors/appError");
const catchAsync = require("../utils/catchAsync");
const { cloudUpload } = require("../utils/cloudinary");
//const { emailService } = require("../utils/emailer");

const dishController = {};

// multer
dishController.upload = upload.array("files", 3);

//create a course
dishController.uploadDish = catchAsync(async (req, res, next) => {
  let {
    dishName,
    description,
    instruction,
    owner,
    date,
    tiktokLink,
    views,
    tags,
    earlyPrep,
    likes,
  } = req.body;

  const dishExist = await Dish.exists({ dishName });
  if (dishExist) return next(new AppError("Dish already Exists", 400));

  // // Generate a specific id for each dish
  let dishId;
  const lastDish = await Dish.find().sort({ _id: -1 }).limit(1);
  if (lastDish.length == 0) {
    dishId = "TTV-1";
  } else {
    dishId = "TTV-" + `${Number(lastDish[0].dishId.split("-")[1]) + 1}`;
  }

  let video;

  let media = [],
    urls = [];
  if (req.files) {
    const files = req.files;
    media = files.map((file) => file.path);
  }
  for (let i = 0; i < media.length; i++) {
    let path = media[i],
      url = await cloudUpload(path);

    if (!url) {
      fs.unlinkSync(path);
      return next(new AppError("Network Error!", 503));
    }
    fs.unlinkSync(path);
    urls.push(url);
  }

  // Add the images and videos
  video = urls[0].url;

  // //save new Course
  const newDish = new Dish({
    dishId,
    dishName,
    video,
  });

  //instance method
  newDish.addAbout(
    date,
    description,
    instruction,
    owner,
    tiktokLink,
    views,
    tags,
    earlyPrep,
    likes
  );

  //save the schema
  newDish.save((err, result) => {
    if (err) return next(new AppError({ message: err.message }, 400));
    else {
      //send a response
      res.status(201).send({
        message: "Dish Uploaded Successfully!",
      });
    }
  });
});

//add ingredients
dishController.addIngredients = catchAsync(async (req, res, next) => {
  let { dishId, ingredientName, qty, measurement } = req.body;

  //BECAUSE IS NOT LISTENING FOR ANY FILE, USE RAW TO INPUT YOUR REQUESTS.

  // check if a dish exists
  const dish = await Dish.findOne({ dishId });
  if (!dish) return next(new AppError("Dish not found", 404));

  dish.addIngredients(ingredientName, qty, measurement);

  //save the schema
  dish.save((err, result) => {
    if (err) return next(new AppError({ message: err.message }, 400));
    else {
      //send a response
      res.status(201).send({
        status: "success",
        message: "Ingredient Added Successfully!",
      });
    }
  });
});

//see all dishes
dishController.getAllDishes = catchAsync(async (req, res, next) => {
  const dishes = await Dish.find({});
  if (!dishes) {
    return next(new AppError(`Could not GET all dishes`, 404));
  }

  //send a response
  res.status(200).send({
    status: "status",
    data: dishes,
  });
});

//get a dish by id
dishController.findDish = catchAsync(async (req, res, next) => {
  const dishId = req.params.id;

  let dish = await Dish.findOne({ dishId });
  if (!dish) return next(new AppError("Dish not found", 404));

  //send response
  res.status(200).send({
    status: "success",
    dish,
  });
});
module.exports = dishController;
