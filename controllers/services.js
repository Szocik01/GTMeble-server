const Service = require("../models/services");

exports.addService = (req, res, next) => {
  let content = req.body.content?.trim();
  if (!content) {
    content = "";
  }
  const service = new Service(content);
  service
    .save()
    .then((response) => {
      res
        .status(201)
        .json({
          id: response[0].insertId,
          message: "Service added succesfully",
        });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getService = (req, res, next) => {
  Service.getService()
    .then((response) => {
      if (response[0].length === 0) {
        const error = new Error("No service found");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json(response[0][0]);
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.editService = (req, res, next) => {
  const id = req.body.id;
  let content = req.body.content?.trim();

  if (!id) {
    const error = new Error("Some data is missing");
    error.statusCode = 422;
    throw error;
  }

  if (!content) {
    content = "";
  }

  Service.editServiceById(id, content)
    .then((response) => {
      res.status(200).json({message:"Service edited succesfully"});
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
