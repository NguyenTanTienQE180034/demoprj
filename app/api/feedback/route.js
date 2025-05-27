import { NextResponse } from "next/server";
import { AIModelGenerateFeedbackAndNotes } from "../ai-model/route";

export async function POST(request) {
    try {
        const { coachingOption, conversationId } = await request.json();
        console.log("Feedback Request Body:", {
            coachingOption,
            conversationId,
        });

        const feedback = await AIModelGenerateFeedbackAndNotes(
            coachingOption,
            conversationId
        );
        return NextResponse.json({ feedback });
    } catch (error) {
        console.error("Error in Feedback API:", error);
        return NextResponse.json(
            {
                error: error.message || "Failed to generate feedback",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
