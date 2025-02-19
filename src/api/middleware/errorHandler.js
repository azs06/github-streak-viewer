// errorHandler.js
function errorHandler(err, req, res, next) {
  // Log the error details (optional)
  console.error(err.stack);

  // Set the response status code
  const statusCode = err.statusCode || 500;

  // Send a JSON response with the error message
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Include stack trace in development mode for debugging
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

export { errorHandler };
