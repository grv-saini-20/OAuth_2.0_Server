import express from "express";
import {authorize, token} from "../controllers/oauthcontroller.js";

const router = express.Router();

router.get("/authorize", authorize);
router.post("/token", token);

export default router;
