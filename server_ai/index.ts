import chalk from "chalk";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import http from "http";
import router from "./router";
import connectToDb from "./src/db/dbService";
const app = express();
const server = http.createServer(app);

const configuredOrigins = [
  process.env.APP_URL,
  process.env.CLIENT_URL,
  process.env.CORS_ORIGINS,
]
  .flatMap((value) => (value || "").split(","))
  .map((value) => value.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://dream770catcher.netlify.app",
  ...configuredOrigins,
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin.replace(/\/+$/, ""))) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(router);
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(
    chalk.blue(`Listening on: ${process.env.SERVER_URL || `http://:${PORT}`}`)
  );
  connectToDb();
  const shouldSeed = (process.env.SEED_ON_START || "").toLowerCase() === "true";
  if (shouldSeed) {
    import("./src/seed/runSeeding")
      .then(({ default: loadInitialData }) => loadInitialData())
      .catch((error) => console.error("Seeding failed:", error));
  }
});
