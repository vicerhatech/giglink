import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "../middleware/errorMiddleware.js";

export function createApp() {
  const app = express();
  const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

  app.use(cors({ origin: allowedOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/health", (_request, response) => {
    response.status(200).json({
      success: true,
      message: "GigLink API is healthy",
      data: { status: "ok" },
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
