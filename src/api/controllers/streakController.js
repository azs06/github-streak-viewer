import {
  getAllTimeContributions,
  getFirstCommit,
} from "../../services/githubService";
import { formatDate } from "../../utils/dateUtils";
import { getSvg } from "../../utils/svgUtils";
import { getRange } from "../../utils/githubUtils";

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
}

export { streakController };
