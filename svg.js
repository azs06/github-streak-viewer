const getSvg = ({currentStreak, currentStreakRange, longestStreak, longestStreakRange, totalContributions, firstCommitDate}) => {
    const svg = `
    <svg width="530" height="190" xmlns="http://www.w3.org/2000/svg">
      <style>
        .title { font: 600 18px 'Segoe UI', sans-serif; fill: #58a6ff }
        .stat { font: 600 14px 'Segoe UI', sans-serif; fill: #8b949e }
        .number { font: 600 28px 'Segoe UI', sans-serif; fill: #c9d1d9 }
      </style>
      <rect width="530" height="190" fill="#0d1117" rx="4.5"/>
      <text x="25" y="30" class="title">GitHub Contribution Streak</text>
      ${currentStreak && `<g transform="translate(25, 60)">
        <text class="stat">Current Streak</text>
        <text class="number" y="40">${currentStreak} days</text>
        <text class="stat" y="70">${currentStreakRange}</text>
      </g>`}
      <g transform="translate(200, 60)">
        <text class="stat">Longest Streak</text>
        <text class="number" y="40">${longestStreak} days</text>
        <text class="stat" y="70">${longestStreakRange}</text>
      </g>
      <g transform="translate(375, 60)">
        <text class="stat">Total Contributions</text>
        <text class="number" y="40">${totalContributions}</text>
        <text class="stat" y="70">${firstCommitDate}</text>
      </g>
    </svg>
  `;
  return svg
}

export {
    getSvg
}