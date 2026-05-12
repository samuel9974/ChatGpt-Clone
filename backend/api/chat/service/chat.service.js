import db from "../../../db/db.config.js";

const createConversationService = async (question) => {
  try {
    // validation
    if (!question.trim()) {
      const error = new Error("Question is required");
      error.status = 400;
      throw error;
    }

    //get recent conversation rows
    const historyRows = await getRecentConversationsRows();

    // insert conversation into db
    await db.execute(
      "INSERT INTO conversations (role, content) VALUES (?, ? )",
      ["user", question]
    );

    return {
      status: true,
      message: "Conversation created successfully",
    };
  } catch (error) {
    throw error;
  }
};

const getRecentConversationsRows = async (limit = 5) => {
  // validation of limit
  const normalizedLimit = Number.parseInt(limit, 10);
  const safeLimit =
    Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 20 : normalizedLimit;

  try {
    const [rows] = await db.execute(
      `SELECT * 
      FROM conversations 
      WHERE role = 'user'
      ORDER BY created_at DESC LIMIT ${safeLimit}`
    );
    return rows.reverse();
  } catch (error) {
    throw error;
  }
};

export { createConversationService, getRecentConversationsRows };
