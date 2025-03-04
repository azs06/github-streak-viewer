import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(import.meta.dirname, "../../.env") });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const PORT = process.env.PORT || 3002;
const ALLOWED_USERS = process.env.ALLOWED_USERS || [];


export { GITHUB_TOKEN, PORT, ALLOWED_USERS };
