import express from "express";
import { formatDate } from "./helpers.js";
import { getSvg } from "./svg.js";
import { getFirstCommit, getAllTimeContributions } from "./github.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.get("/streak/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const firstCommitData = await getFirstCommit(username);
    const firstCommitDate = firstCommitData?.date;
    const currentDate = new Date().toISOString();
    const longestStreakData = await getAllTimeContributions(
      username,
      firstCommitDate,
      currentDate
    );

   //return res.json(longestStreakData);
    const formattedDate = formatDate(firstCommitDate, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const { longestStreak, currentStreak, total } = longestStreakData;
    const currentStreakRange = currentStreak
      ? `${currentStreak.start} - ${currentStreak.end}`
      : "";
    const longestStreakRange = longestStreak
      ? `${longestStreak.start} - ${longestStreak.end}`
      : "";
    const longestStreakLength = longestStreak?.length;
    const currentStreakLength = currentStreak?.length;

    const svg = getSvg({
      currentStreakLength,
      currentStreakRange,
      longestStreakLength,
      longestStreakRange,
      total,
      firstCommitDate: formattedDate,
    });

    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating streak stats");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
