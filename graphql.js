const FIRST_COMMIT_QUERY = `
query ($username: String!) {
  user(login: $username) {
    repositories(first: 100, orderBy: {field: CREATED_AT, direction: ASC}) {
      nodes {
        name
        createdAt
        defaultBranchRef {
          target {
            ... on Commit {
              history(first: 1) {
                edges {
                  node {
                    committedDate
                    message
                    oid
                    author {
                      name
                      email
                    }
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

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

const CONTRIBUTION_QUERY_DATE_TIME = `
query ($username: String!, $fromDate: DateTime!, $toDate: DateTime!) {
    user(login: $username) {
        contributionsCollection(from: $fromDate, to: $toDate) {
            contributionCalendar {
                weeks {
                    contributionDays {
                        date
                        contributionCount
                    }
                }
            }
        }
    }
}
`;

export { CONTRIBUTION_QUERY, FIRST_COMMIT_QUERY, CONTRIBUTION_QUERY_DATE_TIME };
