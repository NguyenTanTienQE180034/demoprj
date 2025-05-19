import { NextResponse } from "next/server";
import OpenAI from "openai";
import { CoachingOptions } from "@/services/Options";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY); // Debug

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

const pollyClient = new PollyClient({
    region: "ap-southeast-2",
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY,
    },
});

const ConvertTextToSpeech = async (text, expertName) => {
    const command = new SynthesizeSpeechCommand({
        Text: text,
        VoiceId: expertName || "Joanna",
        OutputFormat: "mp3",
        SampleRate: "22050",
        LanguageCode: "en-US",
    });
    try {
        const { AudioStream } = await pollyClient.send(command);
        const audioArrayBuffer = await AudioStream.transformToByteArray();
        // Chuyển audio buffer thành base64 để gửi về client
        const audioBase64 = Buffer.from(audioArrayBuffer).toString("base64");
        return audioBase64;
    } catch (error) {
        console.error("Error converting text to speech:", error);
        throw error;
    }
};

export async function POST(request) {
    try {
        const { topic, coachingOption, msg } = await request.json();
        console.log("Request Body:", { topic, coachingOption, msg });

        const option = CoachingOptions.find(
            (item) => item.name === coachingOption
        );
        if (!option) {
            return NextResponse.json(
                { error: "Invalid coaching option" },
                { status: 400 }
            );
        }

        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json(
                { error: "Missing OPENROUTER_API_KEY" },
                { status: 500 }
            );
        }

        const PROMPT = option.prompt.replace(
            "{user_topic}",
            topic || "general"
        );
        console.log("Prompt:", PROMPT);

        const completion = await openai.chat.completions.create({
            model: "openai/gpt-3.5-turbo",
            messages: [
                { role: "assistant", content: PROMPT },
                { role: "user", content: msg || "Hello" },
            ],
        });

        const responseText = completion.choices[0].message.content;
        const audioBase64 = await ConvertTextToSpeech(
            responseText,
            option.voiceId || "Joanna"
        );

        return NextResponse.json({
            text: responseText,
            audioBase64: audioBase64, // Trả về dữ liệu audio dưới dạng base64
        });
    } catch (error) {
        console.error("Error in AI Model API:", error);
        console.error("Error Details:", error.response?.data || error.message);
        return NextResponse.json(
            {
                error: error.message || "Failed to call AI model",
                details: error.response?.data || error.message,
            },
            { status: error.status || 500 }
        );
    }
}
