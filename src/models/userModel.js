const jwt = require("../services/jwt");
const crypto = require("../services/crypto");
const { Schema, model } = require("mongoose");

// prototype to convert strings to title
String.prototype.toTitleCase = function () {
  return this.toLowerCase()
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

const reqStr = {
  type: String,
  required: true,
  lowercase: true,
  trim: true,
};

const userSchema = new Schema(
  {
    name: reqStr,
    doB: {
      type: String,
      // 15/04/2001  dd/mm/yyyy
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: {
      hash: {
        type: String,
        required: true,
      },
      salt: String,
    },
    savedDishes: [
      {
        type: Schema.Types.ObjectId,
        ref: "SavedRecipe",
      },
    ],
    userTikTokLink: {
      type: String,
      default: "tiktok.com",
    },
    lastLoginTime: Date,
    lastLogoutTime: Date,
    passwordChangedAt: {
      type: Date,
      default: new Date(),
    },
    token: String,
    resetToken: {
      type: String,
      default: "",
    },
  },
  {
    timeStamp: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

//// Instance Methods
// Set Password
userSchema.methods.setPassword = function (password) {
  this.password.salt = crypto.salt();
  this.password.hash = crypto.hash(password, this.password.salt);
};

// Validate Password
userSchema.methods.isValidPassword = function (password) {
  const hash = crypto.hash(password, this.password.salt);
  return this.password.hash === hash;
};

// Generate Token
userSchema.methods.genJwt = function () {
  const expire = new Date();
  expire.setDate(expire.getDate() + 1);
  return jwt.sign({ id: this._id, email: this.email, name: this.name });
};

// Generate Reset Token
userSchema.methods.genResetToken = function () {
  const expire = new Date();
  expire.setDate(expire.getDate() + 1);
  return jwt.signResetToken({ id: this._id }, this.password.hash);
};

// Get Name
userSchema.methods.getFullName = function () {
  return this.name.toTitleCase();
};

// add saved dish
userSchema.methods.saveDish = function (savedDish) {
  return this.savedDishes.push(savedDish);
};

// add tik tok link
module.exports = model("User", userSchema);
