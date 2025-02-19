import express from "express";
import helmet from "helmet";
import { streakRouter } from "./api/controllers/streakController.js";

const app = express();
app.use(helmet());
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.status(404).send("404 not found");
});

app.use((err, req, res, next) => {
  res.status(500).send("Server error");
});

app.use(streakRouter)

export { app };
