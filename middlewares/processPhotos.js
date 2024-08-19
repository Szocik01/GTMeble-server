const multer = require("multer");
const uuid = require("uuid");
const sharp = require("sharp");
const path = require("path");
const {sizeExtentionMap} = require("../utils/constants");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("images", "postsGallery"));
  },
  filename: (req, file, cb) => {
    cb(null, uuid.v4() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: fileStorage, fileFilter: fileFilter });

const processPhoto = (req, res, next) => {
  upload.array("images")(req, res, (err) => {
    if (err) {
      console.log(err);
      const error = new Error("File upload failed");
      error.statusCode = 422;
      next(error);
      return;
    }

    if (!req.files.length) {
      next();
      return;
    }

    const promisesArray = [];
    req.files.forEach((file) => {
      const filePathObject = path.parse(file.path);
      const sharpImage = sharp(file.path);
      sizeExtentionMap.forEach((size) => {
        const promiseWrapperFunction = () => {
          return sharpImage.metadata().then((metadata) => {
            return sharpImage
              .resize(
                Math.floor(metadata.width * size.factor),
                Math.floor(metadata.height * size.factor)
              )
              .toFile(
                path.join(
                  filePathObject.dir,
                  filePathObject.name + "-" + size.name + filePathObject.ext
                )
              );
          });
        };
        promisesArray.push(promiseWrapperFunction);
      });
      const promiseWrapperFunction = () => {
        return sharpImage.metadata().then((metadata) => {
          const imageRatio = metadata.width / metadata.height;
          return sharpImage
            .resize(35, Math.floor(35 / imageRatio))
            .toFile(
              path.join(
                filePathObject.dir,
                filePathObject.name + "-preview" + filePathObject.ext
              )
            );
        });
      };
      promisesArray.push(promiseWrapperFunction);
    });

    Promise.all(
      promisesArray.map((promiseFunction) => {
        return promiseFunction();
      })
    ).finally(() => {
      next();
    });
  });
};

module.exports = processPhoto;
