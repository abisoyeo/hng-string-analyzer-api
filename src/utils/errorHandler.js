export default function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  console.error(error.stack);

  if (error.code === "ECONNABORTED") {
    statusCode = 504;
    message = "External API timeout";
  } else if (error.response) {
    statusCode = error.response.status;
    message = error.response.data?.message || "External API error";
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
}
