const express = require("express");
const router = express.Router();
const postsControllers = require("../controllers/posts");
const isAuthMiddleware = require("../middlewares/isAuth");
const processPhoto = require("../middlewares/processPhotos");

router.get("/api/posts",postsControllers.getAllPosts);

router.get("/api/posts/categories",postsControllers.getAllPostsCategories);

router.get("/api/post/:id",postsControllers.getSinglePost);

router.delete("/api/post/delete/:id",isAuthMiddleware,postsControllers.deletePost);

router.put("/api/post/edit",isAuthMiddleware,processPhoto,postsControllers.editPost);

router.post("/api/post/add",isAuthMiddleware,processPhoto,postsControllers.addPost);


module.exports=router;
