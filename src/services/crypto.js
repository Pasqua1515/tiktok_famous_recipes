const crypto = require("crypto");

exports.salt = () => {
  return crypto.randomBytes(32).toString("hex");
};

exports.hash = (pwd, salt) => {
  return crypto.pbkdf2Sync(pwd, salt, 10000, 64, "sha512").toString("hex");
};
