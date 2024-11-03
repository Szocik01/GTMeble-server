const fs = require("fs");
const promisesFs = fs.promises;
const path = require("path");
const { sizeExtentionMap } = require("./constants");

const clearImages = (
  deleteChildrenPhotos,
  checkAccessToFiles,
  ...filePaths
) => {
  let formattedFilePaths = filePaths;

  if (deleteChildrenPhotos) {
    filePaths.forEach((filePath) => {
      const filePathObject = path.parse(filePath);
      sizeExtentionMap.forEach((size) => {
        formattedFilePaths.push(
          path.join(
            filePathObject.dir,
            filePathObject.name + "-" + size.name + filePathObject.ext
          )
        );
      });
      formattedFilePaths.push(
        path.join(
          filePathObject.dir,
          filePathObject.name + "-preview" + filePathObject.ext
        )
      );
    });
  }
  formattedFilePaths = formattedFilePaths.map((filePath) => {
    return filePath.includes("/var/")
      ? filePath
      : path.join(__dirname, "..", filePath);
  });
  console.log(formattedFilePaths);
  return Promise.all(
    checkAccessToFiles === true
      ? formattedFilePaths.map((filePath) => {
          return promisesFs.access(filePath);
        })
      : [Promise.resolve()]
  )
    .then(() => {
      return Promise.all(
        formattedFilePaths.map((filePath) => {
          return promisesFs.unlink(filePath);
        })
      );
    })
    .catch(() => {
      const error = new Error("Could not delete some photos");
      error.statusCode = 422;
      throw error;
    });
};

module.exports = clearImages;
