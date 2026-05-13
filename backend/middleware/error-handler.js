/**
 * Express error-handling middleware: logs the error and returns a JSON error payload.
 * Assumes `err`, `req`, `res`, and `next` are not null or undefined.
 *
 * @param err - Error (or error-like) object; `err.status` selects HTTP status when set, otherwise `500`.
 * @param req - Express request (unused for the response body but part of the middleware signature).
 * @param res - Express response used to send JSON.
 * @param next - Express `next` (unused after handling; kept for standard 4-arg middleware shape).
 * @returns {import("express").Response} - JSON body `{ status: false, message: string }` with status `err.status` or `500`.
 *   Typical `message` values: `err.message` when present, otherwise `"Something went wrong try again later"`.
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Error in request:", err.message);
  return res.status(err.status || 500).json({
    status: false,
    message: err.message || "Something went wrong try again later",
  });
};
