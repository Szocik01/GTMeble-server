const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const cors = require("cors");
const helmet = require("helmet");
const servicesRoutes = require("./routes/services");

const app = express();
app.use(cors({ allowedHeaders: ["Content-Type", "Authorization"] }));

app.use(bodyParser.json());

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/auth", authRoutes);
app.use(postsRoutes);
app.use(servicesRoutes);

app.use(helmet());

app.use((error, req, res, next) => {
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  res.status(error.statusCode).json({ message: error.message });
});

app.listen(process.env.PORT || 8080);
