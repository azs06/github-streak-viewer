import {
  getAllTimeContributions,
  getFirstCommit,
  getLastCommit,
} from "../../services/githubService.js";
async function contributionController(req, res) {
  // get all time contributions
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
    res.json({
      firstCommit: firstCommitData,
      totalCommits: streakData?.total || 0,
      ...streakData
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting contribution data");
  }
}

async function firstCommitController(req, res) {
  try {
    const { username } = req.params;
    const firstCommitData = await getFirstCommit(username);
    res.json(firstCommitData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting contribution data");
  }
}

async function latestCommitController(req, res) {
  try {
    const { username } = req.params;
     res.json(getLastCommit(username));
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting contribution data");
  }
}

export { contributionController, firstCommitController, latestCommitController };
