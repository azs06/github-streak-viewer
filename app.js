const express = require("express");
const fetch = require("node-fetch");
const {
  FIRST_COMMIT_QUERY,
  CONTRIBUTION_QUERY,
  CONTRIBUTION_QUERY_DATE_TIME,
} = require("./grapql");
const { formatDate, getStreak, calculateLongestStreak } = require("./helpers");
const { saveCache, getCache } = require("./cache");
const { getSvg } = require("./svg");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 3001;

const CONTRIBUTION_KEY = "github_contribution";
const FIRST_COMMIT_KEY = "github_first_commit";
const ALL_TIME_CONTRIBUTION_KEY = "github_all_time_contribution";

// GitHub Personal Access Token (optional but recommended)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

async function getContributions(username) {
  const cachedData = await getCache(CONTRIBUTION_KEY);
  if (cachedData.status == 200) {
    return cachedData.value;
  }
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 24); // 24 hour
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: CONTRIBUTION_QUERY,
      variables: { username },
    }),
  });

  if (!response.ok) throw new Error("GitHub API request failed");
  const data = response.json();
  await saveCache(CONTRIBUTION_KEY, data, expiration);
  return data;
}

async function getAllTimeContributions(username, fromDate) {
  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: CONTRIBUTION_QUERY_DATE_TIME,
        variables: { username, from: fromDate },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GitHub API error: ${error.message}`);
    }

    const data = await response.json();
    return data.data.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error(`Error fetching contributions: ${error.message}`);
    return null;
  }
}

async function getFirstCommit(username) {
  const cachedData = await getCache(FIRST_COMMIT_KEY);
  if (cachedData.status == 200) {
    return cachedData.value;
  }
  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: FIRST_COMMIT_QUERY,
        variables: { username },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GitHub API error: ${error.message}`);
    }

    const data = await response.json();

    if (!data.data?.user?.repositories?.nodes.length) {
      console.log(`No repositories found for user: ${username}`);
      return null;
    }

    const oldestRepo = data.data.user.repositories.nodes.find(
      (repo) => repo.defaultBranchRef?.target?.history?.edges.length
    );

    if (!oldestRepo) {
      console.log(`No commits found for user: ${username}`);
      return null;
    }

    const firstCommit =
      oldestRepo.defaultBranchRef.target.history.edges[0].node;
    const toReturn = {
      repository: oldestRepo.name,
      date: firstCommit.committedDate,
      message: firstCommit.message,
      url: firstCommit.url,
    };
    await saveCache(FIRST_COMMIT_KEY, toReturn, Infinity);
    return toReturn;
  } catch (error) {
    console.error(`Error fetching first commit: ${error.message}`);
    return null;
  }
}

async function getLongestStreak(username) {
  try {
    const firstCommitData = await getFirstCommit(username);
    if (!firstCommitData) return;
    const { date } = firstCommitData;

    const contributionData = await getAllTimeContributions(username, date);
    if (!contributionData) return;

    const contributionDays = contributionData.weeks.flatMap(
      (week) => week.contributionDays
    );
    const { maxStreak, longestStreakRange } =
      calculateLongestStreak(contributionDays);

    return { maxStreak, longestStreakRange };
  } catch (error) {
    console.error(`Error calculating longest streak: ${error.message}`);
  }
}

function calculateStreaks(contributionDays) {
  const currentStreaks = getStreak(contributionDays.reverse());
  return {
    currentStreak: currentStreaks.streak,
    totalContributions: currentStreaks.total,
    currentStreakRange: currentStreaks.range,
  };
}

app.get("/streak/:username", async (req, res) => {
  try {
    const { username } = req.params;
    let data = await getContributions(username);
    let firstCommitData = await getFirstCommit(username);
    const longestStreakData = await getLongestStreak(username);
    const contributionDays =
      data.data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
        (week) => week.contributionDays
      );

    const { currentStreak, totalContributions, currentStreakRange } =
      calculateStreaks(contributionDays);
    const { maxStreak: longestStreak, longestStreakRange } = longestStreakData;
    const { date } = firstCommitData;
    const formattedDate = formatDate(date, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

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
