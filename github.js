import { graphql } from "@octokit/graphql";
import { CONTRIBUTION_QUERY_DATE_TIME } from "./graphql.js";

const fetchContributionData = async (username, token, fromDate, toDate) => {

  const variables = { username, fromDate, toDate };

  const response = await graphql(CONTRIBUTION_QUERY_DATE_TIME, {
    ...variables,
    headers: {
      authorization: `token ${token}`,
    },
  });

  return response.user.contributionsCollection.contributionCalendar.weeks;
};

const parseContributionData = (weeks) => {
  const contributions = [];
  weeks.forEach((week) => {
    week.contributionDays.forEach((day) => {
      contributions.push({ date: day.date, count: day.contributionCount });
    });
  });
  return contributions;
};

const calculateStreaks = (contributions) => {
  const streaks = [];
  let currentStreak = 0;
  let streakStartDate = null;
  let streakEndDate = null;

  contributions.forEach(({ date, count }) => {
    if (count > 0) {
      if (currentStreak === 0) {
        streakStartDate = date;
      }
      currentStreak += 1;
      streakEndDate = date;
    } else {
      if (currentStreak > 0) {
        streaks.push({
          start: streakStartDate,
          end: streakEndDate,
          length: currentStreak,
        });
      }
      currentStreak = 0;
    }
  });

  if (currentStreak > 0) {
    streaks.push({
      start: streakStartDate,
      end: streakEndDate,
      length: currentStreak,
    });
  }

  return streaks.sort((a, b) => b.length - a.length);
};

const fetchAllContributionData = async (username, token, startYear) => {
  const currentYear = new Date().getFullYear();
  let allContributions = [];

  for (let year = startYear; year <= currentYear; year++) {
    const fromDate = `${year}-01-01T00:00:00Z`;
    const toDate = `${year}-12-31T23:59:59Z`;
    const weeks = await fetchContributionData(
      username,
      token,
      fromDate,
      toDate
    );
    const contributions = parseContributionData(weeks);
    allContributions = allContributions.concat(contributions);
  }

  return allContributions;
};

const getLongestStreak = async (username, startYear = 2012, token) => {
  try {
    const contributions = await fetchAllContributionData(
      username,
      token,
      startYear
    );
    const streaks = calculateStreaks(contributions);
    const topStreak = streaks[0];
    return topStreak;
  } catch (error) {
    console.error(error.message);
    return error;
  }
};

export { getLongestStreak };
