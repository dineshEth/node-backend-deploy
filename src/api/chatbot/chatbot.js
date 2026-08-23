import Client from "../../utils/chat.class.js";
import dotenv from "dotenv";

dotenv.config();

const mistralClient = new Client(process.env.MISTRAL_API_KEY).getMistralClient();

export async function generateResponse(prompt) {
    try {
        const response = await mistralClient.chat.complete({
            model: "mistral-large-latest",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });
        return response.choices[0].message;
    } catch (error) {
        console.error("Error generating response:", error);
        throw new Error("Failed to generate response");
    }
}



