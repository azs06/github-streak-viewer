import express from "express";
import { streakController } from "../controllers/streakController";

const router = express.Router();

router.get("/streak/:username", streakController);

export { router as streakRouter };
