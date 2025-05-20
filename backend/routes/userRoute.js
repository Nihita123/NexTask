import express from "express";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  updatePassword,
  updateProfile,
} from "../controllers/userController";
const userRouter = express.Router();

//public links
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

//private links protect also
userRouter.get("/me", getCurrentUser);
userRouter.put("/profile", updateProfile);
userRouter.put("/password", updatePassword);
