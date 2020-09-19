const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    // const error = new Error("Not authenticated");
    // error.statusCode = 401;
    // throw error;
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  const token = authHeader.split(" ")[1];
  try {
    decodedToken = jwt.verify(token, "secretkey");
  } catch (err) {
    // const error = new Error("Not authenticated");
    // error.statusCode = 401;
    // throw error;
    req.isAuth = false;
  }

  if (!decodedToken) {
    // const error = new Error("Not authenticated");
    // error.statusCode = 401;
    // throw error;
    req.isAuth = false;
  }
  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
};
