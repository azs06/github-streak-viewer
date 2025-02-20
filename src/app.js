import express from "express";
import helmet from "helmet";
import { streakRouter } from "./api/routes/streakRoutes.js";
import { errorHandler } from "./api/middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.disable("x-powered-by");
app.use(errorHandler);
app.use(streakRouter);
app.use((req, res, next) => {
  res.status(404).send("404 not found");
});



export { app };
