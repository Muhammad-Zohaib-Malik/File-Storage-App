import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import {
  getCurrentUser,
  login,
  logout,
  logoutFromAllDevices,
  register,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/", checkAuth, getCurrentUser);

router.post("/logout", logout);
router.post("/logout-all", logoutFromAllDevices);


export default router;
