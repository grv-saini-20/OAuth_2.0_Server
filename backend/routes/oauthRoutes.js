import express from "express";
import {authorize, token, userInfo, jwks, refresh} from "../controllers/oauthController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/authorize", authorize);
router.post("/token", token);
router.get("/userinfo", protect, userInfo);
router.get("/jwks", jwks);
router.post("/refresh", refresh);

export default router;
