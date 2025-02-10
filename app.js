import express from "express";
//import fetch from "node-fetch";
import { graphql } from "@octokit/graphql";
import { FIRST_COMMIT_QUERY, CONTRIBUTION_QUERY } from "./graphql.js";
import { formatDate, getStreak } from "./helpers.js";
import { saveCache, getCache } from "./cache.js";
import { getSvg } from "./svg.js";
import { getLongestStreak } from "./github.js";
import dotenv from "dotenv";

dotenv.config();

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
  const variables = { username };

  /*   const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: CONTRIBUTION_QUERY,
      variables: { username },
    }),
  }); */

  const response = await graphql(CONTRIBUTION_QUERY, {
    ...variables,
    headers: {
      authorization: `token ${GITHUB_TOKEN}`,
    },
  });

  //if (!response?.ok) throw new Error("GitHub API request failed");
  //const data = response.json();
  await saveCache(CONTRIBUTION_KEY, response, expiration);
  return response;
}

async function getFirstCommit(username) {
  const cachedData = await getCache(FIRST_COMMIT_KEY);
  if (cachedData.status == 200) {
    return cachedData.value;
  }
  try {
    const variables = { username };

    const response = await graphql(FIRST_COMMIT_QUERY, {
      ...variables,
      headers: {
        authorization: `token ${GITHUB_TOKEN}`,
      },
    });

    const data = {
      ...response,
    };

    if (!data?.user?.repositories?.nodes.length) {
      console.log(`No repositories found for user: ${username}`);
      return null;
    }

    const oldestRepo = data.user.repositories.nodes.find(
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

async function getAllTimeContributions(username, fromDate) {
  try {
    const today = new Date();
    today.setHours(today.getHours() + 24);
    const cachedData = await getCache(ALL_TIME_CONTRIBUTION_KEY);
    if (cachedData.status == 200) {
      return cachedData.value;
    }
    const date = new Date(fromDate);
    const year = date.getFullYear();
    const data = getLongestStreak(username, year, GITHUB_TOKEN);
    saveCache(ALL_TIME_CONTRIBUTION_KEY, data, today);
    return data;
  } catch (error) {
    console.error(`Error fetching contributions: ${error.message}`);
    return null;
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
    console.log({ firstCommitData });
    const longestStreakData = await getAllTimeContributions(
      username,
      firstCommitData?.date
    );
    const contributionDays =
      data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
        (week) => week.contributionDays
      );

    const { currentStreak, totalContributions, currentStreakRange } =
      calculateStreaks(contributionDays);
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
