const db = require("../utils/database");

class User {
  constructor(email, hashedPassword, permission) {
    this.email = email;
    this.hashedPassword = hashedPassword;
    this.permission = permission;
  }

  addUser() {
    return db.execute(
      "Insert into users (email, password, idPermissions) values (?, ?, (select id from permissions where permission = ?))",
      [this.email, this.hashedPassword, this.permission]
    );
  }

  static getUserByEmail(email) {
    return db.execute(
      "select * from users join permissions on users.idPermissions = permissions.id where email = ?",
      [email]
    );
  }

}

module.exports = User;
