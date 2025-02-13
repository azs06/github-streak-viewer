import express from "express";
import { formatDate, getStreak } from "./helpers.js";
import { getSvg } from "./svg.js";
import {
  getLongestStreak,
  getContributions,
  getFirstCommit,
  getAllTimeContributions,
} from "./github.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

function calculateStreaks(contributionDays) {
  const currentStreaks = getStreak(contributionDays);
  return {
    currentStreak: currentStreaks.longestStreak,
    totalContributions: currentStreaks.total,
    currentStreakRange: currentStreaks.range,
  };
}

app.get("/streak/:username", async (req, res) => {
  try {
    const { username } = req.params;
    //const firstCommitData = await getFirstCommit(username);
    const firstCommitDate = "2012-11-05T11:32:22Z";
    const currentDate = new Date().toISOString();
    const longestStreakData = await getAllTimeContributions(
      username,
      firstCommitDate,
      currentDate
    );

    //const contributionData = await getContributions(username);

    return res.json(longestStreakData);

    /*     const contributionDays =
      contributionData.user.contributionsCollection.contributionCalendar.weeks.flatMap(
        (week) => week.contributionDays
      ); */

    /*     const { currentStreak, totalContributions, currentStreakRange } =
      calculateStreaks(contributionDays); */
    const currentStreak = 0;
    const totalContributions = 0;
    const currentStreakRange = "";
    const { date } = firstCommitData;
    const formattedDate = formatDate(date, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const longestStreak = longestStreakData ? longestStreakData.length : 0;
    const longestStreakRange = longestStreakData
      ? `${longestStreakData.start} - ${longestStreakData.end}`
      : "";

    const svg = getSvg({
      currentStreak,
      currentStreakRange,
      longestStreak,
      longestStreakRange,
      totalContributions,
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
