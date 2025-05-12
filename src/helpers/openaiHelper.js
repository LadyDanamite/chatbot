import OpenAI from "openai";
import dotenv from "dotenv"
dotenv.config()
const chatClient = new OpenAI({apiKey: process.env.OPEN_AI_KEY});
export default chatClient
