const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let userData;
  User.getUserByEmail(email)
    .then((response) => {
      const dataRow = response[0];
      if (dataRow.length === 0) {
        const error = new Error("Given email is not correct");
        error.statusCode = 401;
        throw error;
      }
      userData = dataRow[0];
      return bcrypt.compare(password, userData.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Incorrect password");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: userData.email,
          userId: userData.id,
          permission: userData.permission,
        },
        "testtest2137",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, permission: userData.permission });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.signup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email.includes("@") || !email.includes(".")) {
    const error = new Error("Invalid email");
    error.statusCode = 422;
    throw error;
  }
  if (password.length < 8) {
    const error = new Error("Invalid password");
    error.statusCode = 422;
    throw error;
  }
  User.getUserByEmail(email)
    .then((response) => {
      const dataRow = response[0];
      if (dataRow.length > 0) {
        const error = new Error("User with given email already exists.");
        error.statusCode = 422;
        throw error;
      }
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      const user = new User(email, hashedPassword, "user");
      return user.addUser();
    })
    .then((result) => {
      res.status(201).json({ message: "User created succesfully." });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
