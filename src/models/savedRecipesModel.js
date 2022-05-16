const { Schema, model } = require("mongoose");
const reqStr = {
  type: String,
  required: true,
};

const savedRecipesSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  dish: {
    type: Schema.Types.ObjectId,
    ref: "Dish",
  },
});

module.exports = model("savedRecipe", savedRecipesSchema);
