import { graphql } from "@octokit/graphql";
import { GITHUB_TOKEN } from "../config/config";

export const graphqlClient = graphql.defaults({
  headers: {
    authorization: `token ${GITHUB_TOKEN}`,
  },
});
