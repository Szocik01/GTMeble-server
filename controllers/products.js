const Product = require("../models/products");
const path = require("path");
const fs = require("fs");

exports.getAllProducts = (req, res, next) => {
  Product.getAllProducts()
    .then((response) => {
      const products = response[0];
      res.status(200).json(products);
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getProductById = (req, res, next) => {
  const id = req.params.id;
  Product.getProductById(id)
    .then((response) => {
      if(response[0].length===0)
      {
        const error = new Error("Product not found.");
        error.statusCode=404;
        throw error;
      }
      const product = response[0][0];
      res.status(200).json(product);
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.addProduct = (req, res, next) => {
  if (!req.file) {
    const error = new Error("No image has been uploaded");
    error.statusCode = 422;
    throw error;
  }

  const name = req.body.name;
  const description = req.body.description;
  const price = req.body.price;
  const imageUrl = req.file.path.replace("\\", "/");

  if (!name || !description || !price) {
    clearImage(imageUrl);
    const error = new Error("Some field data is missing.");
    error.statusCode = 422;
    throw error;
  }

  Product.getProductByName(name)
    .then((result) => {
      const productsArray = result[0];
      if (productsArray.length > 0) {
        const error = new Error("Post with this name already exists.");
        error.statusCode = 400;
        throw error;
      }
      const product = new Product(name, description, imageUrl, price);
      return product.save();
    })
    .then((response) => {
      res.status(201).json({
        message: "Product created succesfully.",
        product: {
          name: name,
          description: description,
          price: price,
          imageUrl: imageUrl,
        },
      });
    })
    .catch((error) => {
      clearImage(imageUrl);
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.editProducts = (req, res, next) => {
  const id = req.body.id;
  const name = req.body.name;
  const description = req.body.description;
  const price = req.body.price;
  let imageUrl = req.body.imageUrl;

  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }

  if (!imageUrl) {
    const error = new Error("No image has been selected");
    error.statusCode = 422;
    throw error;
  }

  if (!id || !name || !description || !price) {
    const error = new Error("Some field data is missing.");
    error.statusCode = 422;
    throw error;
  }

  Product.getProductById(id)
    .then((result) => {
      if (result[0].length === 0) {
        const error = new Error("Could not find any post");
        error.statusCode = 404;
        throw error;
      }
      const product = result[0][0];
      if (product.imageURL !== imageUrl) {
        clearImage(product.imageURL);
      }
      return Product.editProduct(id, name, description, imageUrl, price);
    })
    .then((result) => {
      res.status(200).json({
        message: "Product updated succesfully",
        product: {
          id: id,
          name: name,
          description: description,
          price: price,
          imageUrl: imageUrl,
        },
      });
    })
    .catch((error) => {
      if (req.file) {
        clearImage(imageUrl);
      }
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.deleteProducts = (req, res, next) => {
  const id = req.body.id;
  Product.getProductById(id)
    .then((result) => {
      if(result[0].length===0)
      {
        const error=new Error("Could not find any post");
        error.statusCode=404;
        throw error;
      }
      const productData = result[0][0];
      clearImage(productData.imageURL);
      return Product.deleteProductById(id);
    })
    .then((response) => {
      res.status(200).json({ message: "Product deleted succesfully." });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (error) => {
    if (error) {
      error.statusCode = 500;
      throw error;
    }
  });
};
