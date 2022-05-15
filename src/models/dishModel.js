const req = require("express/lib/request");
const { type } = require("express/lib/response");
const { Schema, model } = require("mongoose");
const reqStr = {
  type: String,
  required: true,
};

const dishSchema = new Schema(
  {
    dishId: {
      type: String,
      unique: true,
    },
    dishName: reqStr,
    about: {
      date: reqStr,
      description: reqStr,
      earlyPrep: String,
      ingredients: [
        {
          ingredientName: reqStr,
          qty: reqStr,
          measurement: String,
        },
      ],
      instruction: reqStr,
      owner: reqStr,
      tiktokLink: reqStr,
      views: reqStr, // not definitive
      likes: { type: String, default: 0 },
      tags: String,
    },
    video: String,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

//// INSTANCE METHODS
//Add about
dishSchema.methods.addAbout = function (
  date,
  description,
  instruction,
  owner,
  tiktokLink,
  views,
  tags,
  earlyPrep,
  likes
) {
  this.about.description = description;
  this.about.instruction = instruction;
  this.about.owner = owner;
  this.about.tiktokLink = tiktokLink;
  this.about.owner = owner;
  this.about.views = views;
  this.about.date = date;
  this.about.tags = tags;
  this.about.earlyPrep = earlyPrep;
  this.about.likes = likes;
};

// Add Ingredients
dishSchema.methods.addIngredients = function (
  ingredientName,
  qty,
  measurement
) {
  const all = {
    ingredientName,
    qty,
    measurement,
  };
  this.about.ingredients.push(all);
};

//add early prep

module.exports = model("Dish", dishSchema);
