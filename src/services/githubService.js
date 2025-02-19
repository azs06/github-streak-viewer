import { getCache, saveCache } from "./cacheService";
import { ALL_TIME_CONTRIBUTION_KEY, FIRST_COMMIT_KEY } from "../constants";
import {
  CONTRIBUTION_QUERY_DATE_TIME,
  FIRST_COMMIT_QUERY,
  CONTRIBUTION_QUERY,
} from "../graphql/graphql";
import { graphqlClient } from "../graphql/graphql-client";

async function getAllTimeContributions(
  username,
  fromDate,
  currentDate = new Date()
) {
  try {
    const today = new Date();
    today.setHours(today.getHours() + 24);
    const cachedData = await getCache(ALL_TIME_CONTRIBUTION_KEY);
    if (cachedData.status == 200) {
      return cachedData.value;
    }
    const date = new Date(fromDate);
    const year = date.getFullYear();
    const data = getStreakData(username, year, currentDate);
    saveCache(ALL_TIME_CONTRIBUTION_KEY, data, today);
    return data;
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
    const variables = { username };

    const response = await graphqlClient(FIRST_COMMIT_QUERY, {
      ...variables,
    });

    const data = {
      ...response,
    };

    if (!data?.user?.repositories?.nodes.length) {
      const msg = `No repositories found for user: ${username}`;
      console.error(msg);
      return Promise.reject(msg);
    }

    const oldestRepo = data.user.repositories.nodes.find(
      (repo) => repo.defaultBranchRef?.target?.history?.edges.length
    );

    if (!oldestRepo) {
      const msg = `No commits found for user: ${username}`;
      console.error(msg);
      return Promise.reject(msg);
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

const fetchContributionData = async (username, fromDate, toDate) => {
  const variables = { username, fromDate, toDate };
  const key = `${CONTRIBUTION_DATA}_${fromDate}_${toDate}_${username}`;
  const cachedData = await getCache(key);
  if (cachedData.status == 200) {
    return cachedData.value;
  }

  const response = await graphqlClient(CONTRIBUTION_QUERY_DATE_TIME, {
    ...variables,
  });

  const data = response.user.contributionsCollection.contributionCalendar.weeks;
  const today = new Date();
  const year = today.getFullYear();
  const toDateYear = toDate.split("-")[0]; // date format example: 24-12-31
  /* expiration is 7 days for current year, infinity for previous years */
  const expiration =
    toDateYear >= year % 100 ? today.setDate(today.getDate() + 7) : Infinity;

  saveCache(key, data, expiration);

  return data;
};

async function getContributions(username) {
  const cachedData = await getCache(CONTRIBUTION_KEY);
  if (cachedData.status == 200) {
    return cachedData.value;
  }
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 24); // 24 hour
  const variables = { username };
  const response = await graphqlClient(CONTRIBUTION_QUERY, {
    ...variables,
  });
  await saveCache(CONTRIBUTION_KEY, response, expiration);
  return response;
}

const getStreakData = async (
  username,
  startYear = 2012,
  currentDate = new Date()
) => {
  try {
    const contributions = await fetchAllContributionData(username, startYear);
    const data = calculateStreaks(contributions);
    // find streak end matching current date or previous date
    const findStreak = (streakEnd, currentDate) => {
      function isDateValid(dateStr) {
        return !isNaN(new Date(dateStr));
      }
      if (!isDateValid(streakEnd) || !isDateValid(currentDate)) return;
      const previousDay = new Date();
      previousDay.setDate(new Date(currentDate).getDate() - 1);
      const streakEndDateString = new Date(streakEnd).toDateString();
      return (
        streakEndDateString == new Date(currentDate).toDateString() ||
        streakEndDateString == previousDay.toDateString()
      );
    };
    const currentStreak = data.streaks.find((streak) =>
      findStreak(streak.end, currentDate)
    );
    // already sorted
    const longestStreak = data.streaks[0];
    return {
      ...data,
      currentStreak,
      longestStreak,
    };
  } catch (error) {
    console.error(error.message);
    return error;
  }
};

export {
  getAllTimeContributions,
  getFirstCommit,
  fetchContributionData,
  getContributions,
  getStreakData,
};
