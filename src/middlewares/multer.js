const multer = require("multer");
const path = require("path");

//multer config
module.exports = multer({
  storage: multer.diskStorage({
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname +
          "-" +
          uniqueSuffix +
          "-" +
          file.originalname.split(path.extname(file.originalname))[0]
      );
    },
  }),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (
      ext !== ".mp4" &&
      ext !== ".mov" &&
      ext !== ".wmv" &&
      ext !== ".jpg" &&
      ext !== ".jpeg" &&
      ext !== ".png"
    ) {
      cb(
        new Error(
          `File type with name: ${file.originalname} has an unsupported extension: ${ext}`
        ),
        false
      );
      return;
    }
    cb(null, true);
  },
});
