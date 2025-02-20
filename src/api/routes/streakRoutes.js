import express from "express";
import { streakController } from "../controllers/streakController.js";

const router = express.Router();

router.get("/streak/:username", streakController);

export { router as streakRouter };
