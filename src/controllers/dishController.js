const fs = require("fs");
const Dish = require("../models/dishModel");
const upload = require("../middlewares/multer");
//const User = require("../models/userModel"); // for likes
const AppError = require("../errors/appError");
const catchAsync = require("../utils/catchAsync");
const { cloudUpload } = require("../utils/cloudinary");
//const { emailService } = require("../utils/emailer");
//const StudentContent = require("../model/studentContentModel");

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
  const lastCourse = await Dish.find().sort({ _id: -1 }).limit(1);
  if (lastCourse.length == 0) {
    dishId = "TTV-1";
  } else {
    dishId = "TTV-" + `${Number(lastCourse[0].dishId.split("-")[1]) + 1}`;
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

  //instance methods

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

// enroll in a course
dishController.enrollCourse = catchAsync(async (req, res, next) => {
  //find course by  id
  const courseId = req.params.id;

  let course = await Course.findOne({ courseId });
  if (!course)
    return next(new AppError(`Course with id: ${courseId} not found`, 404));

  //find user
  let user = await User.findById({ _id: req.USER_ID });
  if (!user) return next(new AppError("Authorization Failed", 403));

  // check if user is already enrolled in course
  if (user.enrolledCourses.includes(course._id)) {
    return res.status(208).send({
      status: "success",
      message: "Already Enrolled In Course",
    });
  }

  //check if course is free
  if (course.description.price === "Free") {
    // change course data by adding a new enrolled student
    course.enroll(req.USER_ID);
    //add course to a students data
    user.enroll(course.courseId, course._id);

    // save user and send response to client
    user.save((err, _) => {
      if (err)
        return next(
          new AppError("Could Not Enroll User, Something Went Wrong", 400)
        );
      course.save((err, _) => {
        if (err)
          return next(
            new AppError("Could Not Enroll User, Something Went Wrong", 400)
          );

        //send mail
        let body = {
          data: {
            courseName: course.courseName,
            title: `You're In! Welcome to ${course.courseName} course`,
            courseLink: `https://mobiusorg.netlify.app/dashboard/myCourses/viewCourse/${course.courseId}`,
          },
          recipient: user.email,
          subject: `You're In! Welcome to ${course.courseName} course`,
          type: "pwd_reset",
          attachments: [
            {
              filename: "mobius-logo.png",
              path: "https://res.cloudinary.com/mobius-kids-org/image/upload/v1651507811/email%20attachments/mobius-logo.png",
              cid: "mobius-logo",
            },
            {
              filename: "welcome-go.gif",
              path: "https://res.cloudinary.com/mobius-kids-org/image/upload/v1651752953/email%20attachments/welcome-go.gif",
              cid: "welcome-go",
            },
          ],
        };

        let mailer = new emailService();
        mailer.enrollSuccess(body);

        //send response
        res.status(200).send({
          status: "success",
          message: `Successfully enrolled in course: ${course.courseName}`,
        });
      });
    });
  } else {
    // Payment
    let email = user.email,
      amountTrue = course.description.price,
      amount = String(Number(course.description.price) * 100);

    paystack.initalizeTransaction(
      {
        email,
        amount,
        metadata: {
          email,
          amountTrue,
          courseId,
          userId: user._id,
          name: user.getFullName(),
        },
      },
      res
    );
  }
});

// verify payment
dishController.verify = catchAsync(async (req, res, next) => {
  const ref = req.query.reference;
  paystack.verify(ref, Course, User, Payment, res);
});

// get courses a user enrolled in
dishController.getMyCourses = catchAsync(async (req, res, next) => {
  //find user
  User.findById({ _id: req.USER_ID })
    .populate({ path: "enrolledCourses" })
    .then((result) => {
      if (!result) return next(new AppError("Could not get my courses", 400));
      //send response
      else {
        res.status(200).send({
          status: "success",
          enrolledCourses: result.enrolledCourses,
          enrolledCoursesDetails: result.enrolledCoursesDetails,
        });
      }
    });
});

//student create new content
dishController.studentUpload = catchAsync(async (req, res, next) => {
  let { description, title } = req.body;
  let courseId = req.params.courseId;

  // check if course exist
  const course = await Course.findOne({ courseId });
  if (!course) return next(new AppError("Course not found", 404));

  //check if user is logged
  let user = await User.findById({ _id: req.USER_ID });
  if (!user) return next(new AppError("User not found", 400));

  // get video for content
  let videoUrl;
  if (req.files) {
    const path = req.files[0].path;
    videoUrl = await cloudUpload(path);

    if (!videoUrl) {
      fs.unlinkSync(path);
      return next(new AppError("Network Error!", 503));
    }
    fs.unlinkSync(path);
  }

  //create new Schema
  const newStudentContent = new StudentContent({
    uploader: req.USER_ID,
    courseTitle: course.courseName,
    courseId,
    titlec: title,
    videoc: videoUrl.url,
    descriptionc: description,
    courseImage: course.description.image,
  });

  //save the schema
  newStudentContent.save((err, result) => {
    if (err) return next(new AppError({ message: err.message }, 400));
    else {
      //send a response
      res.status(201).send({
        status: "success",
        message: "Student content uploaded successfully",
      });
    }
  });
});

module.exports = dishController;
