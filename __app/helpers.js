const formatDate = (date, options = {}) => {
  const defaultOptions = {
    month: "short",
    day: "numeric",
  };
  const optionToUse = { ...defaultOptions, ...options };
  return new Date(date)?.toLocaleDateString("en-US", optionToUse);
};

const getLongestStreakRange = (streakRange) => {
  if (!streakRange || typeof streakRange !== "object" || Object.keys(streakRange).length === 0) {
    return "";
  }
  const longestStreakLength = Math.max(...Object.keys(streakRange).map(Number));
  const range = streakRange[longestStreakLength];
  return range ? `${range.start} - ${range.end}` : "";
};

const getRange = (streakObject) => {
  if (!streakObject?.start || !streakObject?.end) return "";
  return `${formatDate(streakObject.start)} - ${formatDate(streakObject.end)}`;
};

const parseContributionData = (weeks) => weeks.flatMap((week) => week.contributionDays);

const getStreak = (contributions = []) => {
  if (!Array.isArray(contributions) || contributions.length === 0) {
    return { total: 0, range: "", longestStreak: 0, streaks: [] };
  }

  let streaks = [];
  let streakRange = {};
  let streakStart = null;
  let streakEnd = null;
  let currentStreak = 0;
  let total = 0;

  const addStreak = () => {
    if (currentStreak > 0) {
      streaks.push({ start: streakStart, end: streakEnd, length: currentStreak });
      streakRange[currentStreak] = { start: formatDate(streakStart), end: formatDate(streakEnd) };
    }
  };

  contributions.forEach(({ contributionCount, date }) => {
    if (contributionCount > 0) {
      if (currentStreak === 0) streakStart = date;
      currentStreak++;
      streakEnd = date;
    } else {
      addStreak();
      currentStreak = 0;
    }
    total += contributionCount;
  });

  addStreak(); // Handle last streak

  return {
    total,
    range: getLongestStreakRange(streakRange),
    longestStreak: streaks.length ? Math.max(...streaks.map((s) => s.length)) : 0,
    streaks,
  };
};

const calculateStreaks = (contributions) => {
  const streakData = getStreak(contributions);
  return { ...streakData, streaks: streakData.streaks.sort((a, b) => b.length - a.length) };
};

export { formatDate, getStreak, calculateStreaks, parseContributionData, getRange };
