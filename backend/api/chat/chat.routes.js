import express from "express";
import {
  createConversationController
} from "./controller/chat.controller.js";

const chatRouter = express.Router();

chatRouter.post("/conversations", createConversationController);


export default chatRouter;
