export const errorHandler = (err, req, res, next) => {
  console.error(" Error detectado:", {
    message: err.message,
    stack: err.stack,
  });
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message,
  });
};
