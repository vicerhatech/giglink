import "dotenv/config";
import { createApp } from "./app/app.js";
import { connectDatabase } from "./app/database.js";

const port = Number(process.env.PORT) || 5000;
const app = createApp();

async function start() {
  try {
    await connectDatabase();
    app.listen(port, () => console.info(`GigLink API listening on port ${port}`));
  } catch (error) {
    console.error("Unable to start GigLink API", error);
    process.exit(1);
  }
}

start();
