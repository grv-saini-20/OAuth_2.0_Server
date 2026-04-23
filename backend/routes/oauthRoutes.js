import express from "express";
import {authorize, token} from "../controllers/oauthController.js";

const router = express.Router();

router.get("/authorize", authorize);
router.post("/token", token);

router.post("/token", (req, res, next) => {
  console.log("TOKEN ROUTE HIT");
  next();
}, token);

export default router;
