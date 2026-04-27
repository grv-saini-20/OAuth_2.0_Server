import express from "express";
import {authorize, token, userInfo, jwks} from "../controllers/oauthController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/authorize", authorize);
router.post("/token", token);
router.get("/userinfo", protect, userInfo);
router.get("/jwks", jwks);

export default router;
