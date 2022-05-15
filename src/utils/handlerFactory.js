exports.getOne = (Model, param) => {
  return Model.findOne({ param });
};

exports.getById = (Model, _id) => {
  return Model.findById(_id);
};
