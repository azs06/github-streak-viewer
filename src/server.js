import { app } from "./app";

import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
