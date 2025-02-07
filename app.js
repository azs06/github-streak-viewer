const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3001;

// GitHub Personal Access Token (optional but recommended)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

console.log({ GITHUB_TOKEN });

// GraphQL query to get contribution data
const CONTRIBUTION_QUERY = `
  query ($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

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

  console.log({ response });

  if (!response.ok) throw new Error("GitHub API request failed");
  return response.json();
}

function calculateStreaks(contributionDays) {
  let tempStreak = 0;
  const streaks = {
    current: [],
    longest: [],
    total: 0,
  }

  const reversedArray = contributionDays.reverse();
  // first day is today
  reversedArray.forEach((day) => {
    if (day.contributionCount > 0) {
      tempStreak++;
    }else{
        streaks.current.push(tempStreak)
        tempStreak = 0;
    }
    streaks.total += day.contributionCount;
  });

  contributionDays.forEach(day => {
    if(day.contributionCount > 0){
        tempStreak++
    }else{
        streaks.longest.push(tempStreak)
        tempStreak = 0;
    }
  })

  return {
    currentStreak: streaks.current.reduce((a, b) => Math.max(a, b), -Infinity),
    longestStreak: streaks.longest.reduce((a, b) => Math.max(a, b), -Infinity),
    totalContributions: streaks.total
  };
}

app.get("/streak/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const data = await getContributions(username);
    const contributionDays =
      data.data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
        (week) => week.contributionDays
      );

    const { currentStreak, longestStreak, totalContributions } =
      calculateStreaks(contributionDays);

    const svg = `
      <svg width="530" height="150" xmlns="http://www.w3.org/2000/svg">
        <style>
          .title { font: 600 18px 'Segoe UI', sans-serif; fill: #58a6ff }
          .stat { font: 600 14px 'Segoe UI', sans-serif; fill: #8b949e }
          .number { font: 600 28px 'Segoe UI', sans-serif; fill: #c9d1d9 }
        </style>
        <rect width="530" height="150" fill="#0d1117" rx="4.5"/>
        <text x="25" y="30" class="title">GitHub Contribution Streak</text>
        <g transform="translate(25, 60)">
          <text class="stat">Current Streak</text>
          <text class="number" y="40">${currentStreak} days</text>
        </g>
        <g transform="translate(200, 60)">
          <text class="stat">Longest Streak</text>
          <text class="number" y="40">${longestStreak} days</text>
        </g>
        <g transform="translate(375, 60)">
          <text class="stat">Total Contributions</text>
          <text class="number" y="40">${totalContributions}</text>
        </g>
      </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
  } catch (error) {
    res.status(500).send("Error generating streak stats");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
