// Import dependencies
//const User = require("../model/userModel");
const jwt = require("../services/jwt");
const AppError = require("../errors/appError");

exports.auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || undefined;
  if (!token) return next(new AppError("Token Not Found!", 401));

  const decoded = jwt.decode(token);
  if (!decoded) return next(new AppError("User Authorization Failed", 403));

  const user = await User?.findById({ _id: decoded.id });
  if (!user) return next(new AppError("User Not Logged In!", 401));

  req.USER_ID = user?._id || undefined;
  req.name = user?.name || undefined;
  next();
};
