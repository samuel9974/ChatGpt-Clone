import {
  createConversationService,
} from "../service/chat.service.js";

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


export { createConversationController };
