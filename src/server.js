import "dotenv/config";
import express from "express";
import createError from "http-errors";
import stringRouter from "./routes/stringRoutes.js";
import errorHandler from "./utils/errorHandler.js";
import limiter from "./utils/rateLimit.js";
import { connectToMongoDB } from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.use(limiter);
app.use("/strings", stringRouter);

app.use("/*", (req, res, next) => {
  next(createError(404, `Cannot ${req.method} ${req.originalUrl}`));
});

app.use(errorHandler);

await connectToMongoDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB and start server:", error);
  });
