import { Router } from "express"
import { generateResponse } from "./chatbot.js"


const chatbotRouter = Router()

chatbotRouter.post("/", async (req, res) => {
    const { prompt } = req.body;

    try {
        const response = await generateResponse(prompt);
        res.status(200).json({ response: response });
    } catch (error) {
        console.error("Error generating response:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
})

export default chatbotRouter