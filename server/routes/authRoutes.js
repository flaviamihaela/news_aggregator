import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

//Post new user details
router.post("/register", authController.register);

//Post existing user details
router.post("/login", authController.login);

//Get user details
router.get("/profile", authController.profile);

//Post logout request
router.post("/logout", authController.logout);

export default router;
