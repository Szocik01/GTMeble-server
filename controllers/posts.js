const Post = require("../models/posts");
const clearImages = require("../utils/clearImages");

exports.getAllPosts = (req, res, next) => {
  const postsResponse = {};
  Post.getAllPostsContent()
    .then((response) => {
      postsResponse.postsContent = response[0];
      return Post.getAllPhotos();
    })
    .then((response) => {
      postsResponse.postsPhotos = response[0];
      return Post.getAllPostsCategories();
    })
    .then((response) => {
      postsResponse.postsCategories = response[0].map((item) => {
        return item.category;
      });
      res.status(200).json(postsResponse);
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getAllPostsCategories = (req, res, next) => {

  Post.getAllPostsCategories().then((response) => {
    const categories = response[0].map((item) => {
      return item.category;
    });

    res.status(200).json({categories: categories});

  }).catch((error) => {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  });

}

exports.getSinglePost = (req, res, next) => {
  const id = req.params.id;
  const responsePost = {};
  Post.getPostById(id)
    .then((response) => {
      if (response[0].length === 0) {
        const error = new Error("Post not found.");
        error.statusCode = 404;
        throw error;
      }
      const post = response[0][0];
      responsePost.postContent = post;
      return Post.getPhotosByPostId(id);
    })
    .then((response) => {
      if (response[0].length === 0) {
        const error = new Error("No photos for post has been found.");
        error.statusCode = 404;
        throw error;
      }
      responsePost.postPhotos = response[0];
      res.status(200).json(responsePost);
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};


exports.addPost = (req, res, next) => {
  if (!req.files.length) {
    const error = new Error("No image has been uploaded");
    error.statusCode = 422;
    next(error);
    return;
  }

  const title = req.body.title?.trim();
  const description = req.body.description?.trim();
  const category = req.body.category?.trim();
  const imageUrls = req.files.map((item) => {
    return item.path.replace(/\\/g, "/");
  });

  if (!title || !description || !category) {
    const error = new Error("Some field data is missing.");
    error.statusCode = 422;
    clearImages(true,false, ...imageUrls)
      .catch((cleanupError) => {
        error.cleanupError = cleanupError;
      })
      .finally(() => {
        next(error);
      });
    return;
  }

  const post = new Post(title, description, category, ...imageUrls);
  post
    .save()
    .then((response) => {
      res.status(201).json({
        message: "Post created succesfully.",
        post: {
          title: title,
          description: description,
          category: category,
          imageUrls: imageUrls,
        },
      });
    })
    .catch((error) => {
      clearImages(true,false, ...imageUrls)
        .catch((cleanupError) => {
          error.cleanupError = cleanupError;
        })
        .finally(() => {
          if (!error.statusCode) {
            error.statusCode = 500;
          }
          next(error);
        });
    });
};

exports.editPost = async (req, res, next) => {
  const id = req.body.id;
  const title = req.body.title;
  const description = req.body.description;
  const category = req.body.category;
  let deletedPhotos = req.body.deletedPhotos || [];
  let imageUrls = [];

  if (req.files) {
    imageUrls = req.files.map((item) => {
      return item.path.replace(/\\/g, "/");
    });
  }

  if (!Array.isArray(deletedPhotos)) {
    deletedPhotos = [deletedPhotos];
  }

  if (!id || !title || !description || !category) {
    const error = new Error("Some field data is missing.");
    error.statusCode = 422;
    try {
      await clearImages(true,false, ...imageUrls);
    } catch (cleanupError) {
      error.cleanupError = cleanupError;
    } finally {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
      return;
    }
  }
  try {
    const postsResponse = await Post.getPostById(id);

    if (postsResponse[0].length === 0) {
      const error = new Error("Could not find any post");
      error.statusCode = 401;
      throw error;
    }
    const postsAmountReponse = await Post.getAmountOfPhotosInPostById(id);
    if (deletedPhotos.length > 0) {
      if (
        deletedPhotos.length >= postsAmountReponse[0][0]["count(id)"] &&
        imageUrls.length === 0
      ) {
        const error = new Error(
          "Tried to delete all previous photos but not provided a new ones."
        );
        error.statusCode = 422;
        throw error;
      }
      await Post.deletePhotosByURLs(...deletedPhotos);
    }

    if (imageUrls.length > 0) {
      await Post.addPostPhotos(id, ...imageUrls);
    }

    await Post.editPostContent(id, title, description, category);
    if (deletedPhotos.length > 0) {
      await clearImages(true, false, ...deletedPhotos);
    }

    res.status(200).json({
      message: "Post updated succesfully",
      post: {
        id: id,
        title: title,
        description: description,
        category: category,
        deletedPhotos: deletedPhotos,
        addedPhotos: imageUrls,
      },
    });
  } catch (error) {
    if (imageUrls && imageUrls.length > 0) {
      await Post.deletePhotosByURLs(...imageUrls);
      try {
        await clearImages(true,false, ...imageUrls);
      } catch (cleanupError) {
        error.cleanupError = cleanupError;
      } finally {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        next(error);
      }
    } else {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    }
  }
};

exports.deletePost = (req, res, next) => {
  const id = req.params.id;
  Post.getPostById(id)
    .then((result) => {
      if (result[0].length === 0) {
        const error = new Error("Could not find any post");
        error.statusCode = 404;
        throw error;
      }
      return Post.deletePostById(id);
    })
    .then((response) => {
      return Post.getPhotosUrlsByPostId(id);
    })
    .then((response) => {
      return Post.deleteAllPhotosByPostId(id).then(() => {
        return clearImages(
          true,false,
          ...response[0].map((item) => {
            return item.path;
          })
        );
      });
    })
    .then((response) => {
      res.status(200).json({ message: "Post deleted succesfully." });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
