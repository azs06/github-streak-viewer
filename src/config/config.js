import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(import.meta.dirname, "../../.env") });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const PORT = process.env.PORT || 3002;


export { GITHUB_TOKEN, PORT };
