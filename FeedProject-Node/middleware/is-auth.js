const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  let decodedToken;
  const token = authHeader.split(" ")[1];
  try {
    decodedToken = jwt.verify(token, "secretkey");
  } catch (err) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
