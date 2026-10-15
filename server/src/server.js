import dotenv from "dotenv";
import { createApp } from "./app/app.js";
import { connectDatabase } from "./app/database.js";

// Workspace scripts run this package with `server/` as the current directory,
// while the project keeps its documented local configuration in the repository
// root. Resolve it relative to this module so both dev scripts load the same
// environment file.
dotenv.config({ path: new URL("../../.env", import.meta.url) });

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
