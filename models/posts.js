const db = require("../utils/database");

class Post {
  constructor(title, description, category, ...imageURLs) {
    this.title = title;
    this.description = description;
    this.category = category;
    this.imageURLs = imageURLs;
  }

  save() {
    return db
      .execute(
        "Insert into post_content (title,description,category) values (?,?,?)",
        [this.title, this.description, this.category]
      )
      .then((response) => {
        return db.query(
          "Insert into post_photos (post_content_id,path) values ?",
          [this.imageURLs.map((item) => {
            return [response[0].insertId, item];
          })]
        );
      });
  }

  static getPostById(id) {
    return db.execute("Select * from post_content where id = ?", [id]);
  }

  static getAllPostsContent() {
    return db.execute("Select * from post_content");
  }

  static getAllPhotos() {
    return db.execute("Select * from post_photos");
  }

  static getAllPostsCategories(){
    return db.execute("Select distinct category from post_content");
  }

  static getAmountOfPhotosInPostById(id) {
    return db.execute(
      "Select count(id) from post_photos where post_content_id = ?",
      [id]
    );
  }

  static getPhotosByPostId(id) {
    return db.execute("Select * from post_photos where post_content_id=?", [
      id,
    ]);
  }

  static getPhotosUrlsByPostId(id) {
    return db.execute("Select path from post_photos where post_content_id=?", [
      id,
    ]);
  }

  static deletePhotosByURLs(...urls) {
    return db.query("Delete from post_photos where path in (?)",
      [urls]
    );
  }

  static editPostContent(id, title, description, category) {
    return db.execute(
      "Update post_content set title=?, description=?, category=? where id=?",
      [title, description, category, id]
    );
  }

  static addPostPhotos(id, ...photosUrlsArray) {
    return db.query(
      "Insert into post_photos (post_content_id,path) values ?",
      [photosUrlsArray.map((item) => {
        return [id, item];
      })]
    );
  }

  static deletePostById(id) {
    return db.execute("delete from post_content where id=?", [id]);
  }

  static deleteAllPhotosByPostId(id) {
    return db.execute("Delete from post_photos where post_content_id=?", [id]);
  }
}

module.exports = Post;
