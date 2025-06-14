import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { raiseHandHandler } from "../controllers/raiseHand.controller.js";

const router = express.Router();

router.post("/", protectRoute, raiseHandHandler);

export default router;