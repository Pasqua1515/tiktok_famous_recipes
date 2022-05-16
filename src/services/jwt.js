const jwt = require("jsonwebtoken");

exports.sign = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET_KEY, {
    expiresIn: 24 * 60 * 60 * 1000,
  });
};

exports.signResetToken = (userId, userPassword) => {
  return jwt.sign(userId, process.env.JWT_RESET_KEY + userPassword, {
    expiresIn: "20m",
  });
};

exports.decode = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) return null;
    else return decoded;
  });
};

exports.decodeResetToken = (token, userPassword) => {
  return jwt.verify(
    token,
    process.env.JWT_RESET_KEY + userPassword,
    (err, decoded) => {
      if (err) return null;
      else return decoded;
    }
  );
};

exports.createSendToken = (user, status, res) => {
  let token = user.genJwt();
  let Fname = user.getFullName();
  user.token = token;
  user = user.toObject();
  user.name = Fname;
  delete user.password;
  delete user.lastLogoutTime;
  delete user.lastLoginTime;
  delete user.__v;
  delete user.resetToken;
  res.status(status).send({
    status: "success",
    message: `Hello ${user.name}! WELCOME!`,
    user,
  });
};
