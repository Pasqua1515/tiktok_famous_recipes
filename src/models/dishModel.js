const req = require("express/lib/request");
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
      description: reqStr,
      earlyPrep: String,
      ingredients: [
        {
          name: String,
          qty: String,
          measurement: String,
        },
      ],
      instruction: reqStr,
      owner: reqStr,
      tiktokLink: reqStr,
      views: {
        required: true,
        type: Number,
      },
      ratings: { enum: [1, 2, 3, 4, 5] },
    },
    video: reqStr,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

//// INSTANCE METHODS
// Add about
dishSchema.methods.addIngredients = function (ingredients) {
  this.about.ingredients.push(ingredients);
};

module.exports = model("Dish", dishSchema);
