import axios from "axios";
import OpenAI from "openai";
import { CoachingOptions } from "./Options";

// export const getToken = async () => {
//     const result = await axios.get("/api/getToken");
//     return result.data;
// };
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true, // Chỉ dùng để test
});
export const AIModel = async (topic, coachingOption, msg) => {
    const option = CoachingOptions.find((item) => item.name === coachingOption);
    const PROMPT = option.prompt.replace("{user_topic}", topic);
    const completion = await openai.chat.completions.create({
        model: "google/gemini-2.5-pro-exp-03-25",
        messages: [
            {
                role: "user",
                content: PROMPT,
            },
            {
                role: "user",
                content: msg,
            },
        ],
    });
    console.log(completion.choices[0].message);
};
