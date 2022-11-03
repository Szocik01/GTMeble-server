const express = require("express");
const router = express.Router();
const productsControllers = require("../controllers/products");
const isAuthMiddleware = require("../middlewares/isAuth");

router.get("/products",productsControllers.getAllProducts);

router.get("/product/:id",productsControllers.getProductById);

router.delete("/product/delete",isAuthMiddleware,productsControllers.deleteProducts);

router.put("/product/edit",isAuthMiddleware,productsControllers.editProducts);

router.post("/product/add",isAuthMiddleware,productsControllers.addProduct);


module.exports=router