const getSvg = ({
  currentStreak,
  currentStreakRange,
  longestStreak,
  longestStreakRange,
  totalContributions,
  firstCommitDate,
}) => {
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
        <text class="stat" y="70">${firstCommitDate}</text>
      </g>
    </svg>
  `;
  return svg;
};

const getSVGRedux = ({
  currentStreak,
  currentStreakRange,
  longestStreak,
  longestStreakRange,
  totalContributions,
  firstCommitDate,
}) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="200" viewBox="0 0 500 200">
    <style>
        @keyframes fadein {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        
        @keyframes scaleUp {
            0% { transform: scale(0.8); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }

        @keyframes glow {
            0% { filter: drop-shadow(0px 0px 5px rgba(255, 165, 0, 0.6)); }
            50% { filter: drop-shadow(0px 0px 10px rgba(255, 165, 0, 1)); }
            100% { filter: drop-shadow(0px 0px 5px rgba(255, 165, 0, 0.6)); }
        }
    </style>
    
    <!-- Background -->
    <rect x="0" y="0" width="500" height="200" rx="10" fill="#181818" stroke="#444" stroke-width="1"/>
    
    <!-- Left: Total Contributions -->
    <text x="100" y="50" font-size="28px" font-weight="bold" fill="url(#gradGreen)" text-anchor="middle" style="animation: fadein 1s ease-in-out;">
        ${totalContributions}
    </text>
    <text x="100" y="80" font-size="14px" fill="lightgreen" text-anchor="middle" style="animation: fadein 1.5s;">
        Total Contributions
    </text>
    
    <!-- Middle: Current Streak -->
    <circle cx="250" cy="85" r="75" stroke="url(#gradBlue)" stroke-width="5" fill="none" style="animation: glow 2s infinite;"/>
    
    <text x="250" y="50" font-size="28px" font-weight="bold" fill="url(#gradBlue)" text-anchor="middle" style="animation: scaleUp 0.6s;">
      ${currentStreak}🔥
    </text>
    <text x="250" y="80" font-size="14px" fill="#00AEFF" text-anchor="middle" style="animation: fadein 1s;">
        Current Streak
    </text>
    
    <!-- Right: Longest Streak -->
    <text x="400" y="50" font-size="28px" font-weight="bold" fill="url(#gradOrange)" text-anchor="middle" style="animation: fadein 1s;">
        ${longestStreak}
    </text>
    <text x="400" y="80" font-size="14px" fill="orange" text-anchor="middle" style="animation: fadein 1.5s;">
        Longest Streak
    </text>
    
    <!-- Date Ranges -->
    <text x="100" y="110" font-size="12px" fill="#ddd" text-anchor="middle">${firstCommitDate} - Present</text>
    <text x="250" y="110" font-size="12px" fill="#ddd" text-anchor="middle">${currentStreakRange}</text>
    <text x="400" y="110" font-size="12px" fill="#ddd" text-anchor="middle">${longestStreakRange}</text>
    
    <!-- SVG Gradients -->
    <defs>
        <linearGradient id="gradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color: #7FFF00; stop-opacity:1"/>
            <stop offset="100%" style="stop-color: #00FF00; stop-opacity:1"/>
        </linearGradient>
        <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color: #00AEFF; stop-opacity:1"/>
            <stop offset="100%" style="stop-color: #007BFF; stop-opacity:1"/>
        </linearGradient>
        <linearGradient id="gradOrange" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color: #FFA500; stop-opacity:1"/>
            <stop offset="100%" style="stop-color: #FF4500; stop-opacity:1"/>
        </linearGradient>
    </defs>
</svg>
`;
};

export { getSvg, getSVGRedux };
