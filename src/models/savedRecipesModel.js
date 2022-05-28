const { Schema, model } = require("mongoose");
const reqStr = {
  type: String,
  required: true,
};

const savedRecipesSchema = new Schema({
  savedDishId: String,
  savedDishes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Dish",
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

//instance methods

// push dish into saved idshes
savedRecipesSchema.methods.pushDish = function (dish_id) {
  return this.savedDishes.push(dish_id);
};




module.exports = model("SavedRecipe", savedRecipesSchema);
