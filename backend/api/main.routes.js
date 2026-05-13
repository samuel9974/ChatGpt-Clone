import express from "express";
import chatRouter from "./chat/chat.routes.js";

const mainRouter = express.Router();

/**
 * Mounts all chat-related routes under the `/api/chat` path.
 * Assumes `mainRouter` and `chatRouter` are not null or undefined.
 *
 * @param path - The base API path used for chat routes.
 * @param router - The chat router that handles conversation endpoints.
 * @returns {express.Router} - The main router with chat routes mounted. Requests may return validation, database, or Gemini error messages from the nested chat routes.
 */
mainRouter.use("/chat", chatRouter);

// /api/admin
// mainRouter.use('/admin', adminRouter);

export default mainRouter;
