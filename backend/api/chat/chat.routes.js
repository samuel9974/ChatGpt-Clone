import express from "express";
import {
  createConversationController,
  getConversationsController,
} from "./controller/chat.controller.js";

const chatRouter = express.Router();

/**
 * Registers the route that creates a new conversation message and assistant reply.
 * Assumes `chatRouter` and `createConversationController` are not null or undefined.
 *
 * @param path - The API path used to create conversations.
 * @param handler - The controller that handles the request and response.
 * @returns {express.Router} - The router with the POST route registered. Requests may return validation, database, or Gemini error messages through the error middleware.
 */
chatRouter.post("/conversations", createConversationController);

/**
 * Registers the route that fetches recent conversation messages.
 * Assumes `chatRouter` and `getConversationsController` are not null or undefined.
 *
 * @param path - The API path used to fetch conversations.
 * @param handler - The controller that handles the request and response.
 * @returns {express.Router} - The router with the GET route registered. Requests may return database error messages through the error middleware.
 */
chatRouter.get("/conversations", getConversationsController);

export default chatRouter;
