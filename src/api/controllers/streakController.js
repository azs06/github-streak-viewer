import {
  getAllTimeContributions,
  getFirstCommit,
} from "../../services/githubService.js";
import { formatDate } from "../../utils/dateUtils.js";
import { getSvg, getSVGRedux } from "../../utils/svgUtils.js";
import { getRange } from "../../utils/githubUtils.js";

async function streakController(req, res) {
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

    const formattedDate = formatDate(firstCommitDate, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const { longestStreak, currentStreak, total } = streakData;
    const currentStreakRange = currentStreak ? getRange(currentStreak) : "";
    const longestStreakRange = longestStreak ? getRange(longestStreak) : "";
    const longestStreakLength = longestStreak?.length || 0;
    const currentStreakLength = currentStreak?.length || 0;

    const svg = getSVGRedux({
      currentStreak: currentStreakLength,
      currentStreakRange,
      longestStreak: longestStreakLength,
      longestStreakRange,
      totalContributions: total,
      firstCommitDate: formattedDate,
    });

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.send(svg);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating streak stats");
  }
}

export { streakController };
