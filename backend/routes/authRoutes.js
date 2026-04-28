import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router =  express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// 🔹 Login Page (redirect to Auth UI)
router.get("/login", (req, res) => {
const query = new URLSearchParams(req.query).toString();

return res.redirect(`http://localhost:5174/login?${query}`);
});

// 🔹 Register Page (redirect to Auth UI)
router.get("/register", (req, res) => {
return res.redirect("http://localhost:5174/register");
});

export default router;