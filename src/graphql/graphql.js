const FIRST_COMMIT_QUERY = `
query ($username: String!) {
  user(login: $username) {
    repositories(first: 10, orderBy: {field: CREATED_AT, direction: ASC}) {
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

const LAST_COMMIT_QUERY = `
query($login: String!) {
  user(login: $login) {
    repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
      nodes {
        name
        defaultBranchRef {
          target {
            ... on Commit {
              history(first: 1) {
                edges {
                  node {
                    committedDate
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`

export { CONTRIBUTION_QUERY, FIRST_COMMIT_QUERY, CONTRIBUTION_QUERY_DATE_TIME, LAST_COMMIT_QUERY };
