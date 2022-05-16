const jwt = require("../services/jwt");
const User = require("../models/userModel");
const AppError = require("../errors/appError");
const catchAsync = require("../utils/catchAsync");
const { validationResult } = require("express-validator");
//const { emailService }     = require('../utils/emailer');

const userAuth = {};
const exclude = {
  lastLoginTime: 0,
  lastLogoutTime: 0,
  passwordChangedAt: 0,
};

// User Sign Up
userAuth.signup = catchAsync(async (req, res, next) => {
  const { name, doB, email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    if (errors.array().includes("email"))
      return next(new AppError("Invalid Email!", 400));
    if (errors.array().includes("doB"))
      return next(new AppError("Invalid date of Birth!", 400));
    if (errors.array().includes("name"))
      return next(new AppError("Please Input Your Full Name!", 400));
    if (errors.array().includes("password"))
      return next(
        new AppError(
          "Password Must Be At Least 8 Characters And Must Contain A Number",
          400
        )
      );
  }

  const userExist = await User.exists({ email });
  if (userExist)
    return next(new AppError("User With Email Already Exists!", 400));

  // create user
  const user = new User();
  // set password
  user.setPassword(password);
  // set details
  user.set({ name, email, doB });
  user.save(async (err, result) => {
    if (err) return next(new AppError("Could Not Create User!", 400));

    // // send mail
    // let body = {
    //   data: {
    //     name: user.getFullName(),
    //     title: `Welcome to Tik Tok Famous ${user.getFullName()}`,
    //   },
    //   recipient: user.email,
    //   subject: `Welcome to Mobius ${user.getFullName()}`,
    //   type: "pwd_reset",
    //   attachments: [
    //     {
    //       filename: "mobius-logo.png",
    //       path: "https://res.cloudinary.com/mobius-kids-org/image/upload/v1651507811/email%20attachments/mobius-logo.png",
    //       cid: "mobius-logo",
    //     },
    //     {
    //       filename: "child-jumping.gif",
    //       path: "https://res.cloudinary.com/mobius-kids-org/image/upload/v1651825445/email%20attachments/child-jumping.gif",
    //       cid: "child-jumping",
    //     },
    //   ],
    // };

    // let mailer = new emailService();
    // await mailer.signup(body);

    // send response
    jwt.createSendToken(result, 201, res);
  });
});

// Login
userAuth.login = catchAsync(async (req, res, next) => {
  // get email and password from form
  const { email, password } = req.body;

  // if email is absent return error
  if (!email) return next(new AppError("Please Provide Email.", 400));

  // if password is absent return error
  if (!password) return next(new AppError("Please Provide Password.", 400));

  // find user with email
  let user = await User.findOne({ email }).select(exclude); //-->  research
  if (!user)
    return next(
      new AppError(
        `User With Email: ${email}, Not Registered. Create Account Instead!`,
        404
      )
    );

  // validate user
  if (user.isValidPassword(password)) {
    user.lastLoginTime = new Date();
    user.lastLogoutTime = null;
    user.save((err, result) => {
      if (err) return next(new AppError("Could Not Create User!", 400));
      // send response
      jwt.createSendToken(result, 201, res);
    });
  } else return next(new AppError("Invalid Email Or Password!", 403));
});

// Forgot Password
userAuth.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // check if user exists
  const user = await User.findOne({ email });
  if (!user)
    return next(
      new AppError(`User With Email: ${email}, Is Not Registered!`, 404)
    );
  else {
    // generate reset token
    const resetToken = user.genResetToken(),
      fullName = user.getFullName();

    user.resetToken = resetToken;
    await user.save();
    // generate one time valid for 20 minutes link
    const link = `${req.get("origin")}/auth/reset-password/${user.resetToken}`;

    // // send mail
    // let body = {
    //   data: {
    //     link,
    //     name: fullName,
    //     title: "Mobius Password Reset",
    //   },
    //   recipient: user.email,
    //   subject: "Mobius Password Reset",
    //   type: "pwd_reset",
    //   attachments: [
    //     {
    //       filename: "mobius-logo.png",
    //       path: "https://res.cloudinary.com/mobius-kids-org/image/upload/v1651507811/email%20attachments/mobius-logo.png",
    //       cid: "mobius-logo",
    //     },
    //     {
    //       filename: "forgot-password.gif",
    //       path: "https://res.cloudinary.com/mobius-kids-org/image/upload/v1651507779/email%20attachments/forgot-password.gif",
    //       cid: "forgot-password",
    //     },
    //   ],
    // };

    // let mailer = new emailService();
    // await mailer.reset(body);

    // send response
    res.status(200).send({
      status: "success",
      message: `Hello ${fullName}, Password Reset Successful! Please Check Your Email For A Link To Change Your Password!`,
    });
  }
});

// Change Password
userAuth.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = req.params.token;

  // check if token exists
  if (!resetToken) return next(new AppError("Token Does Not Exist!", 400));

  // find user with token
  let user = await User.findOne({ resetToken });
  if (!user)
    return next(
      new AppError(
        "Link Expired Or Has Already Been Used! Initiate Another Request.",
        400
      )
    );

  let data = jwt.decodeResetToken(resetToken, user.password.hash),
    newPassword = req.body.password;

  if (!data)
    return next(
      new AppError(
        "Link Expired Or Has Already Been Used! Initiate Another Request."
      )
    );

  // change password
  user.setPassword(newPassword);
  user.passwordChangedAt = new Date();
  user.resetToken = "";
  user.save((err, _) => {
    if (err)
      return next(
        new AppError(
          "Could Not Change Password. We Will Fix It Right Away!",
          400
        )
      );

    //send mail
    let body = {
      data: {
        title: "Password Changed Successfully",
      },
      recipient: user.email,
      subject: "Password Changed Successfully",
      type: "pwd_reset",
      attachments: [
        {
          filename: "mobius-logo.png",
          path: "https://res.cloudinary.com/mobius-kids-org/image/upload/v1651507811/email%20attachments/mobius-logo.png",
          cid: "mobius-logo",
        },
        {
          filename: "password-reset-success.gif",
          path: "https://res.cloudinary.com/mobius-kids-org/image/upload/v1651748529/email%20attachments/password-reset-success.gif",
          cid: "password-reset-success",
        },
      ],
    };

    let mailer = new emailService();
    mailer.resetSuccess(body);

    // send response
    res.status(200).send({
      status: "success",
      message: "Password Changed Successfully!",
    });
  });
});

// logout user
userAuth.logout = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.USER_ID);
  user.lastLogoutTime = new Date();
  user.save((err, _) => {
    if (err) return next(new AppError("Could Not Log User Out!", 400));
    // send response
    res.sendStatus(200);
  });
});

module.exports = userAuth;
