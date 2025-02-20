import { graphql } from "@octokit/graphql";
import { GITHUB_TOKEN } from "../config/config.js";

export const graphqlClient = graphql.defaults({
  headers: {
    authorization: `token ${GITHUB_TOKEN}`,
  },
});
