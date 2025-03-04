import express from "express";
import { streakController } from "../controllers/streakController.js";
import { addUserControl } from "../middleware/auth.js";

const router = express.Router();

router.get("/streak/:username", addUserControl, streakController);

export { router as streakRouter };
