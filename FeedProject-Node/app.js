const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const { uuid } = require("uuidv4");
const { graphqlHTTP } = require("express-graphql");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const auth = require("./middleware/is-auth");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuid());
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

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single("image")
);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  if (!req.file) {
    return res.status(200).json({ message: "No file" });
  }
  return res
    .status(201)
    .json({ message: "File stored", filePath: req.file.path });
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "An unexpected error occurred";
      const status = err.originalError.code || 500;
      return {
        message: message,
        data: data,
        status: status,
      };
    },
  })
);

// app.use("/feed", feedRoutes);
// app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

mongoose
  .connect(
    "mongodb+srv://shreha:IAtsWXsiAfKIvkSX@cluster0.u5mts.mongodb.net/messages?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(8080);
    // const io = require("./socket").init(server);
    // io.on("connection", (socket) => {
    //   console.log("Client connected!");
    // });
  })
  .catch((err) => console.log(err));
