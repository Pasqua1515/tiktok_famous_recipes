const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const dishController = require("../controllers/dishController");

//create dish
router.post("/uploadDish", dishController.upload, dishController.uploadDish);

//add ingredients
router.patch("/addIngredients", dishController.addIngredients);

// find one dish by dish ID
router.get("/findDish/:id", dishController.findDish);


// //get all courses
// router.get(
//     "/all",
//     dishController
//     .getAllCourses
// );

// //get one course
// router.get(
//     "/getOne/:id",
//     dishController
//     .getOneCourse
// );

// //post user being enrolled
// router.post(
//     "/enroll/:id",
//     auth,
//     dishController
//     .enrollCourse
// );

// //get my courses
// router.get(
//     "/dashboard/myCourses",
//     auth,
//     dishController
//     .getMyCourses
// );

// router.get(
//     "/enroll/verify-transactions/",
//     dishController
//     .verify
// );

// // student upload content
// router.post(
//     "/student-upload/:courseId",
//     auth,
//     dishController
//     .upload,
//     dishController
//     .studentUpload
// );

module.exports = router;
