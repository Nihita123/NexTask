import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

export default async function authMiddleware(req, res, next) {
  //grab the bearer token from authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startswith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "not authorized token missing" });
  }
  const token = authHeader.split(" ")(1);

  //verify and attach user object
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).select("password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "user not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log("JWT verification failed", err);
    return res
      .status(401)
      .json({ success: false, message: "token invalid or expired" });
  }
}
