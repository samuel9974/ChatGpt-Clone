import { createConversationService,
   getRecentConversationsRows } from "../service/chat.service.js";

/**
 * Handles an HTTP request to create a chat turn: persists the user question,
 * calls the chat service for an assistant reply, and responds with JSON.
 * Assumes `req`, `res`, and `next` are not null or undefined.
 *
 * @param req - Express request; expects `req.body.question` (string) for the user message.
 * @param res - Express response used to send `201` JSON on success.
 * @param next - Express `next` function used to forward errors to the error middleware.
 * @returns {Promise<void>} - Sends a response via `res` or delegates via `next(err)`; does not return a value to the caller.
 *   On success: `201` with `{ status: true, data: conversation, message: string }`.
 *   On failure: forwards to `next`; the client may receive `500` (or another status) with `{ status: false, message: string }`
 *   (e.g. database or upstream API errors, or `"Question is required"` when validation fails in the service).
 */
async function createConversationController(req, res, next) {
  try {
    const { question } = req.body;
    const conversation = await createConversationService(question);
    res.status(201).json({
      status: true,
      data: conversation,
      message: "Conversation created successfully",
    });
  } catch (err) {
    next(err);
  }
}


/**
 * Handles an HTTP request to fetch recent conversation messages.
 * Assumes `req`, `res`, and `next` are not null or undefined.
 *
 * @param req - Express request object; no request body is required.
 * @param res - Express response used to send `200` JSON on success.
 * @param next - Express `next` function used to forward errors to the error middleware.
 * @returns {Promise<void>} - Sends a response via `res` or delegates via `next(err)`; does not return a value to the caller.
 *   On success: `200` with `{ status: true, data: conversations, message: string }`.
 *   On failure: forwards to `next`; the client may receive `500` or another error status with a database error message.
 */
async function getConversationsController(req, res, next) {
  try {
    const limit = 1000;
    const conversations = await getRecentConversationsRows(limit);
    res.status(200).json({
      status: true,
      data: conversations,
      message: "Conversations fetched successfully",
    });
  } catch (err) {
    next(err);
  }
}


export { createConversationController, getConversationsController };