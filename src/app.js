import express from "express";
import { formatDate, getRange } from "./helpers.js";
import { getSvg } from "./svg.js";
import { getFirstCommit, getAllTimeContributions } from "./github.js";
import helmet from "helmet";


const app = express();
app.use(helmet());
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.status(404).send("404 not found");
});

app.use((err, req, res, next) => {
  res.status(500).send("Server error");
});

app.get("/streak/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const firstCommitData = await getFirstCommit(username);
    const firstCommitDate = firstCommitData?.date;
    const currentDate = new Date();
    const streakData = await getAllTimeContributions(
      username,
      firstCommitDate,
      currentDate
    );

    const formattedDate = formatDate(firstCommitDate);

    const { longestStreak, currentStreak, total } = streakData;
    const currentStreakRange = currentStreak ? getRange(currentStreak) : "";
    const longestStreakRange = longestStreak ? getRange(longestStreak) : "";
    const longestStreakLength = longestStreak?.length || 0;
    const currentStreakLength = currentStreak?.length || 0;

    const svg = getSvg({
      currentStreak: currentStreakLength,
      currentStreakRange,
      longestStreak: longestStreakLength,
      longestStreakRange,
      totalContributions: total,
      firstCommitDate: formattedDate,
    });

    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating streak stats");
  }
});

export { app };
