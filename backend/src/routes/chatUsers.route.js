
import express from "express";
import { getUserForSidebar } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ Only accepted friends will be shown in chat sidebar
router.get("/", protectRoute, getUserForSidebar);

export default router;
