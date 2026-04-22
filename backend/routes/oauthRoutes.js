import express from "express";
import authorize from "../controllers/oauthcontroller.js";

const router = express.Router();

router.get("/authorize", authorize);

export default router;
