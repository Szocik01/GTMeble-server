const db = require("../utils/database");

class Products {
  constructor(name, description, imageURL, price) {
    this.name = name;
    this.description = description;
    this.imageURL = imageURL;
    this.price = price;
  }

  save() {
    return db.execute(
      "Insert into products (name,description,imageURL,price) values (?,?,?,?)",
      [this.name, this.description, this.imageURL, this.price]
    );
  }

  static getAllProducts() {
    return db.execute("Select * from products");
  }

  static getProductByName(name)
  {
    return db.execute("Select * from products where name=?",[name])
  }

  static getProductById(id) {
    return db.execute("Select * from products where id=?", [id]);
  }

  static editProduct(id, name, description, imageURL, price) {
    return db.execute(
      "Update products set name=?, description=?, imageURL=?, price=? where id=?",
      [name, description, imageURL, price, id]
    );
  }

  static deleteProductById(id) {
    return db.execute("delete from products where id=?", [id]);
  }
}

module.exports = Products;
