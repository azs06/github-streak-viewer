const formatDate = (date, options = {}) => {
  const defaultOptions = {
    month: "short",
    day: "numeric",
  };
  const optionToUse = Object.assign({}, defaultOptions, options);
  return new Date(date)?.toLocaleDateString("en-US", optionToUse);
};

const getLongestStreakRange = (streakRange) => {
  if (
    (!streakRange && typeof streakRange !== "object") ||
    Object.keys(streakRange).length == 0
  ) {
    return "";
  }
  const longestRangeKeys = Object.keys(streakRange);
  const longestStreakRangeKey = longestRangeKeys.reduce(
    (a, b) => Math.max(a, b),
    -Infinity
  );
  const range = streakRange[longestStreakRangeKey];
  return `${range.start} - ${range.end}`;
};

/* 
@param contributions 
*/
const getStreak = (contributions = []) => {
  if (!Array.isArray(contributions) || contributions.length == 0) {
    return {
      total: 0,
      range: "",
      longestStreak: 0,
      streaks: [],
    };
  }

  let streaks = [];
  let streakRange = {};
  let streakStart = null;
  let streakEnd = null;
  let currentStreak = 0;
  let total = 0;

  contributions.forEach((day) => {
    if (day.contributionCount > 0) {
      if (currentStreak === 0) {
        streakStart = day.date; // Start new streak
      }
      currentStreak++;
      streakEnd = day.date; // Keep updating the end of the streak
    } else {
      if (currentStreak > 0) {
        streaks.push({
          start: streakStart,
          end: streakEnd,
          length: currentStreak,
        });
        streakRange[currentStreak] = {
          start: formatDate(streakStart),
          end: formatDate(streakEnd),
        };
      }
      currentStreak = 0; // Reset for the next streak
    }
    total += day.contributionCount;
  });

  // Handle case where the last streak extends to the end of the array
  if (currentStreak > 0) {
    streaks.push({
      start: streakStart,
      end: streakEnd,
      length: currentStreak,
    });
    streakRange[currentStreak] = {
      start: formatDate(streakStart),
      end: formatDate(streakEnd),
    };
  }

  const longestStreakRange = getLongestStreakRange(streakRange);
  return {
    total: total,
    range: longestStreakRange,
    longestStreak: streaks.length
      ? Math.max(...streaks.map((s) => s.length))
      : 0,
    streaks,
  };
};

const calculateStreaks = (contributions) => {
  const { streaks, total, range, longestStreak } = getStreak(contributions);

  return {
    streaks: streaks.sort((a, b) => b.length - a.length),
    total,
    range,
    longestStreak,
  }
};

function calculateLongestStreak(contributionDays) {
  let maxStreak = 0;
  let currentStreak = 0;
  let streakStart = null;
  let streakEnd = null;
  let longestStreakRange = "";

  contributionDays.forEach((day) => {
    if (day.contributionCount > 0) {
      currentStreak++;
      streakEnd = streakEnd || day.date;
    } else {
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        longestStreakRange = `${streakStart} - ${streakEnd}`;
      }
      currentStreak = 0;
      streakStart = null;
      streakEnd = null;
    }
    streakStart = streakStart || day.date;
  });

  if (currentStreak > maxStreak) {
    maxStreak = currentStreak;
    longestStreakRange = `${streakStart} - ${streakEnd}`;
  }

  return { maxStreak, longestStreakRange };
}

const parseContributionData = (weeks) => {
  const contributions = [];
  weeks.forEach((week) => {
    week.contributionDays.forEach((day) => {
      contributions.push({ ...day });
    });
  });
  return contributions;
};

export { formatDate, getStreak, calculateLongestStreak, calculateStreaks, parseContributionData };
