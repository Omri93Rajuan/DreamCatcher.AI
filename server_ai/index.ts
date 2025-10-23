import router from "./router";
import connectToDb from "./src/db/dbService";
import loadInitialData from "./src/seed/runSeeding";
import chalk from "chalk";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "http";

import "dotenv/config";

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(router);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(
    chalk.blue(
      `Listening on: ${process.env.SERVER_URL || `http://localhost:${PORT}`}`
    )
  );
  connectToDb();
  loadInitialData();
});
