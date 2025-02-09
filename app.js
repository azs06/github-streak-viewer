const express = require("express");
const fetch = require("node-fetch");
const { FIRST_COMMIT_QUERY, CONTRIBUTION_QUERY } = require("./grapql");
const { formatDate } = require("./helpers");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3001;

// GitHub Personal Access Token (optional but recommended)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

async function getContributions(username) {
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
  return response.json();
}

const getStreak = (array) => {
  let streakStart = 0;
  let streakEnd = 0;
  let tempStreak = 0;
  let streak = [];
  let streaksObj = {
    total: 0,
    streakRange: {},
    streakStart: null,
    streakEnd: null,
  };
  array.forEach((day, index) => {
    if (day.contributionCount > 0) {
      tempStreak++;
      if (!streakEnd) {
        streakStart = null;
        streakEnd = day.date;
      }
    } else {
      streak.push(tempStreak);
      streakStart = array[index - 1]?.date;
      streaksObj.streakRange[`${tempStreak}`] = {
        start: formatDate(streakStart),
        end: formatDate(streakEnd),
      };
      streakEnd = null;
      tempStreak = 0;
    }
    streaksObj.total += day.contributionCount;
  });
  const longestStreakRange = (() => {
    const longestRangeKeys = Object.keys(streaksObj.streakRange);
    const longestStreakRangeKey = longestRangeKeys.reduce(
      (a, b) => Math.max(a, b),
      -Infinity
    );
    const range = streaksObj.streakRange[longestStreakRangeKey];
    return `${range.start} - ${range.end}`;
  })();
  return {
    total: streaksObj.total,
    range: longestStreakRange,
    streak: streak.reduce((a, b) => Math.max(a, b), -Infinity),
  };
};

async function getFirstCommit(username) {
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

    return {
      repository: oldestRepo.name,
      date: firstCommit.committedDate,
      message: firstCommit.message,
      url: firstCommit.url,
    };
  } catch (error) {
    console.error(`Error fetching first commit: ${error.message}`);
    return null;
  }
}

function calculateStreaks(contributionDays) {
  const reversedArray = contributionDays.reverse();
  const currentStreaks = getStreak(reversedArray);
  const longestStreaks = getStreak(contributionDays);
  return {
    currentStreak: currentStreaks.streak,
    longestStreak: longestStreaks.streak,
    totalContributions: longestStreaks.total,
    longestStreakRange: longestStreaks.range,
    currentStreakRange: currentStreaks.range,
  };
}

app.get("/streak/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const data = await getContributions(username);
    const firstCommitData = await getFirstCommit(username);
    const contributionDays =
      data.data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
        (week) => week.contributionDays
      );

    const {
      currentStreak,
      longestStreak,
      totalContributions,
      longestStreakRange,
      currentStreakRange,
    } = calculateStreaks(contributionDays);
    const { date } = firstCommitData;
    const formattedDate = formatDate(date, {year: "numeric", month: "short", day: "numeric"})

    const svg = `
      <svg width="530" height="190" xmlns="http://www.w3.org/2000/svg">
        <style>
          .title { font: 600 18px 'Segoe UI', sans-serif; fill: #58a6ff }
          .stat { font: 600 14px 'Segoe UI', sans-serif; fill: #8b949e }
          .number { font: 600 28px 'Segoe UI', sans-serif; fill: #c9d1d9 }
        </style>
        <rect width="530" height="190" fill="#0d1117" rx="4.5"/>
        <text x="25" y="30" class="title">GitHub Contribution Streak</text>
        <g transform="translate(25, 60)">
          <text class="stat">Current Streak</text>
          <text class="number" y="40">${currentStreak} days</text>
          <text class="stat" y="70">${currentStreakRange}</text>
        </g>
        <g transform="translate(200, 60)">
          <text class="stat">Longest Streak</text>
          <text class="number" y="40">${longestStreak} days</text>
          <text class="stat" y="70">${longestStreakRange}</text>
        </g>
        <g transform="translate(375, 60)">
          <text class="stat">Total Contributions</text>
          <text class="number" y="40">${totalContributions}</text>
          <text class="stat" y="70">${formattedDate}</text>
        </g>
      </svg>
    `;

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
