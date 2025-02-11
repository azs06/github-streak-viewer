const formatDate = (date, options = {}) => {
  const defaultOptions = {
    month: "short",
    day: "numeric",
  };
  const optionToUse = Object.assign({}, defaultOptions, options);
  return new Date(date)?.toLocaleDateString("en-US", optionToUse);
};

const getLongestStreakRange = (streakRange) => {
  if (!streakRange) return "";
  const longestRangeKeys = Object.keys(streakRange);
  const longestStreakRangeKey = longestRangeKeys.reduce(
    (a, b) => Math.max(a, b),
    -Infinity
  );
  const range = streaksObj.streakRange[longestStreakRangeKey];
  return `${range.start} - ${range.end}`;
};

const getStreak = (array) => {
  if (!Array.isArray(array)) {
    return {
      total: 0,
      range: "",
      streak: 0,
    };
  }
  let streakStart = 0;
  let streakEnd = 0;
  let tempStreak = 0;
  let streak = [];
  let streaksObj = {
    total: 0,
    streakRange: {},
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
  const longestStreakRange = getLongestStreakRange(streaksObj.range);
  return {
    total: streaksObj.total,
    range: longestStreakRange,
    streak: streak.reduce((a, b) => Math.max(a, b), -Infinity),
  };
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

export { formatDate, getStreak, calculateLongestStreak, calculateStreaks };
