import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router =  express.Router();

router.post("/register", registerUser);
router.get("/login", (req, res) => {
  res.send("Login Page (we’ll replace with UI later)");
})
export default router;