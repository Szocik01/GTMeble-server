const express = require("express");
const router = express.Router();
const postsControllers = require("../controllers/posts");
const isAuthMiddleware = require("../middlewares/isAuth");
const processPhoto = require("../middlewares/processPhotos");

router.get("/posts",postsControllers.getAllPosts);

router.get("/posts/categories",postsControllers.getAllPostsCategories);

router.get("/post/:id",postsControllers.getSinglePost);

router.delete("/post/delete/:id",isAuthMiddleware,postsControllers.deletePost);

router.put("/post/edit",isAuthMiddleware,processPhoto,postsControllers.editPost);

router.post("/post/add",isAuthMiddleware,processPhoto,postsControllers.addPost);


module.exports=router;
