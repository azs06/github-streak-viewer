import express from "express";

import { contributionController, firstCommitController, latestCommitController } from "../controllers/contributionController.js";

const router = express.Router();

router.get("/:username", contributionController);
router.get("/first-commit/:username", firstCommitController);
router.get('/last-commit/:username', latestCommitController)

export { router as contributionRouter };