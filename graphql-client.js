import { graphql } from "@octokit/graphql";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

export const graphqlClient = graphql.defaults({
  headers: {
    authorization: `token ${GITHUB_TOKEN}`,
  },
});
