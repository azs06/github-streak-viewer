const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3001;

// GitHub Personal Access Token (optional but recommended)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

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
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: CONTRIBUTION_QUERY,
      variables: { username }
    })
  });

  if (!response.ok) throw new Error('GitHub API request failed');
  return response.json();
}

function calculateStreaks(contributionDays) {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  
  contributionDays.reverse().forEach(day => {
    if (day.contributionCount > 0) {
      tempStreak++;
      if (day.date === today) currentStreak = tempStreak;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }
  });

  return {
    currentStreak: Math.max(currentStreak, tempStreak),
    longestStreak: Math.max(longestStreak, tempStreak),
    totalContributions: contributionDays.reduce((sum, day) => sum + day.contributionCount, 0)
  };
}

app.get('/streak/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const data = await getContributions(username);
    const contributionDays = data.data.user.contributionsCollection
      .contributionCalendar.weeks
      .flatMap(week => week.contributionDays);
    
    const { currentStreak, longestStreak, totalContributions } = calculateStreaks(contributionDays);

    const svg = `
      <svg width="495" height="195" xmlns="http://www.w3.org/2000/svg">
        <style>
          .title { font: 600 18px 'Segoe UI', sans-serif; fill: #58a6ff }
          .stat { font: 600 14px 'Segoe UI', sans-serif; fill: #8b949e }
          .number { font: 600 28px 'Segoe UI', sans-serif; fill: #c9d1d9 }
        </style>
        <rect width="495" height="195" fill="#0d1117" rx="4.5"/>
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

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    res.status(500).send('Error generating streak stats');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});