const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function decodeJWT(token) {
  let decodedJWT;
  try {
    decodedJWT = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    decodedJWT = undefined;
  }
  return decodedJWT;
}

const signToken = (user) => jwt.sign({ id: user._id }, JWT_SECRET);

async function auth(req, res, next) {
  token = req.headers.token;

  if (!token) {
    res.status(401).json({
      status: "fail",
      message: "You are not logged in! Plese log in to get Access",
    });
    return;
  }

  const decodedJWT = decodeJWT(token);

  if (!decodedJWT) {
    res.status(403).json({
      message: "Invalid token",
    });
    return;
  }

  req.userId = decodedJWT?.userId;
  next();
}

module.exports = {
  auth,
  signToken,
};
