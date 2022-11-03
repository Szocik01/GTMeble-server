const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const authRoutes = require("./routes/auth");
const productsRoutes = require("./routes/products");
const uuid = require("uuid");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
app.use(cors({ allowedHeaders: ["Content-Type", "Authorization"] }));

app.use(bodyParser.json());

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuid.v4() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/auth", authRoutes);
app.use(productsRoutes);

app.use(helmet());

app.use((error, req, res, next) => {
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  res.status(error.statusCode).json({ message: error.message });
});

app.listen(process.env.PORT || 8080);
