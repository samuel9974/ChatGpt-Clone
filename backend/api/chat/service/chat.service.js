import db from "../../../db/db.config.js";
import { GoogleGenAI } from "@google/genai";

const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = process.env.GEMINI_MODEL;

/**
 * Creates a new user message in the database, generates an assistant reply with Gemini,
 * stores the assistant message (including token count), and returns a payload for the API layer.
 * Assumes `question` is not null or undefined (may still be invalid if empty or whitespace-only).
 *
 * @param question - The user’s chat message text.
 * @returns {Promise<{ historyRows: Array<object>, assistantAnswer: string }>} - Recent conversation rows used for context
 *   and the assistant’s reply text (`assistantAnswer`).
 *   May reject with an `Error` whose `message` is `"Question is required"` (and `status` `400`) when `question` is empty after trim;
 *   or with database / Gemini failures (driver or API error messages; Gemini may surface quota or model errors in `error.message`).
 */
const createConversationService = async (question) => {
  try {
    if (!question.trim()) {
      const error = new Error("Question is required");
      error.status = 400;
      throw error;
    }

    //get recent conversation rows
    const historyRows = await getRecentConversationsRows();
    console.log("historyRows::", historyRows);
    console.log("================================================================");

    //insert new conversation
    const [result] = await db.execute("INSERT INTO conversations (role, content) VALUES (?, ? )", ["user", question]);
    // console.log("result::", result);
    // console.log("result.insertId::", result.insertId);
    // console.log("================================================================");

    //generate assistant answer
    const {text, totalTokens} = await generateAssistantAnswer(historyRows, question);
    //log the assistant answer and total tokens
    // console.log("text ::", text);
    // console.log("totalTokens ::", totalTokens);
    // console.log("================================================================");

    //insert assistant answer into database
    const [createAssistantMessageResult] = await db.execute( "INSERT INTO conversations (role, content, token_count) VALUES (?, ?, ?)", 
      ["assistant", text, totalTokens]);
    // console.log("createAssistantMessageResult ::", createAssistantMessageResult);
    // console.log("================================================================");

    const userConversation = await getMessageById(result.insertId);
    // console.log("userConversation ::", userConversation);
    // console.log("================================================================");

    const assistantConversation = await getMessageById(createAssistantMessageResult.insertId);
    // console.log("assistantConversation ::", assistantConversation);
    // console.log("================================================================");

    return {
      historyRows,
      assistantAnswer: text,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Loads a single conversation row by primary key and returns a normalized message object.
 * Assumes `messageId` is not null or undefined.
 *
 * @param messageId - Database `id` of the `conversations` row to fetch.
 * @returns {Promise<{ id: number, role: string, content: string, tokenCount: number, createdAt: Date|string } | null>} -
 *   The message fields when a row exists, or `null` when no row matches.
 *   May reject with a database error (e.g. connection or SQL errors reflected in the thrown `Error.message`).
 */
const getMessageById = async (messageId) => {
  const [rows] = await db.execute("SELECT * FROM conversations WHERE id = ? LIMIT 1", [messageId]);
  // console.log("rows", rows);
  // console.log("================================================================");

  if (!rows[0]) return null;
  // console.log("rows[0]", rows[0]);
  // console.log("================================================================");


  return {
    id: rows[0].id,
    role: rows[0].role,
    content: rows[0].content,
    tokenCount: Number(rows[0].token_count || 0),
    createdAt: rows[0].created_at,
  };
};



/**
 * Builds Gemini chat history from prior rows, opens a chat session, and returns the model reply plus token usage.
 * Assumes `historyRows` and `question` are not null or undefined.
 *
 * @param historyRows - Array of prior DB rows used to seed chat `history` (each row is expected to expose `role` and `content`).
 * @param question - The new user message to send with `sendMessage`.
 * @returns {Promise<{ text: string, totalTokens: number }>} - Assistant text (`text`) and `totalTokens` from `usageMetadata.totalTokenCount`.
 *   May reject when Gemini or the SDK fails (e.g. invalid API key, network errors, model errors), or when `usageMetadata` is missing
 *   (possible `Cannot read properties of undefined` style errors from `result.usageMetadata`).
 */
const generateAssistantAnswer = async (historyRows, question) => {
  const formatHistory = historyRows.map((row) => ({
    role: row.role === "assistant" ? "model" : "user",
    parts: [{ text: row.content }],
  }));
  // console.log("formatHistory ::", formatHistory);
  // console.log("================================================================");
 
  try {
    //create chat session with gemini model and history rows as context for the conversation  
    const chat = geminiClient.chats.create({
      // TODO: Add more config options
      model: GEMINI_MODEL,
      config: {
        maxOutputTokens: 1000,
        systemInstruction: `You are an expert software engineering assistant. Your primary role is to help developers write, debug, and understand code.
                            # Core Objectives
                            - Provide accurate, practical, and efficient programming solutions.
                            - Explain technical concepts clearly and concisely.

                            # Constraints & Boundaries
                            - STRICTLY limit your answers to software engineering, programming, computer science, and IT-related topics.
                            - If a user asks about non-programming topics (e.g., travel, health, finance, legal, lifestyle), you MUST politely decline and steer the conversation.
                            - Do not write harmful, malicious, or unethical code.

                            # Tone & Style
                            - Be professional, helpful, and direct.
                            - Keep responses concise; avoid unnecessary fluff.
                            - Use Markdown formatting for readability.
                            - Always wrap code snippets in appropriate language-specific code blocks.`,
      },
      history: formatHistory,
    });
    // console.log("chat ::", chat);
    // console.log("================================================================");

    //send message to gemini
    const result = await chat.sendMessage({ message: question });
    console.log("result ::", result);
    console.log("================================================================");
    return {
      text: result.text,
      totalTokens: result.usageMetadata.totalTokenCount,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches the most recent conversation rows from the database, oldest-first within the window.
 * Assumes `limit` is not null or undefined (defaults apply when it is not a positive integer).
 *
 * @param limit - Desired maximum number of rows to return; coerced to a safe integer (falls back to `20` when invalid).
 * @returns {Promise<Array<object>>} - Rows from `conversations` ordered for chronological use (reversed after a `DESC` query).
 *   May reject with a database error (e.g. connection or SQL errors in the thrown `Error.message`).
 */
const getRecentConversationsRows = async (limit) => {

  //TODO: add validation for limit
  // validation of limit
  const normalizedLimit = Number.parseInt(limit, 10);
  const safeLimit = Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 20 : normalizedLimit;
  

  try {
    const [rows] = await db.execute(`SELECT * FROM conversations ORDER BY created_at DESC LIMIT ${safeLimit}`);
    // console.log("rows ::", rows);
    // console.log("================================================================");
    const reversedRows = rows.reverse();
    // console.log("reversedRows ::", reversedRows);
    // console.log("================================================================");
    return reversedRows;
  } catch (error) {
    throw error;
  }
};



export {
  createConversationService,
  getRecentConversationsRows,
  generateAssistantAnswer,
};
