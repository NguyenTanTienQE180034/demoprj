"use client";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CoachingExpert } from "@/services/Options";
import { UserButton } from "@stackframe/stack";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

function DiscussionRoom() {
    const { roomid } = useParams();
    const [expert, setExpert] = useState();
    const [enableMic, setEnableMic] = useState(false);
    const [messages, setMessages] = useState([]);
    const recognizer = useRef(null);
    const chatContainerRef = useRef(null);
    const audioRef = useRef(null);

    const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
        id: roomid,
    });

    useEffect(() => {
        if (DiscussionRoomData) {
            const Expert = CoachingExpert.find(
                (item) => item.name === DiscussionRoomData?.expertName
            );
            setExpert(Expert);
        }
    }, [DiscussionRoomData]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const startRecording = () => {
        setEnableMic(true);
        console.log("Starting Azure Speech recognition...");
        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
            process.env.YOUR_AZURE_KEY ||
                "9QqL4dRzha86AbpvDdwY6TYObibfq0bLcKjw4mNGetDkFhaq90cbJQQJ99BEACHYHv6XJ3w3AAAAACOGvAtE",
            process.env.YOUR_AZURE_REGION || "eastus2"
        );
        speechConfig.speechRecognitionLanguage = "en-US";
        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        recognizer.current = new SpeechSDK.SpeechRecognizer(
            speechConfig,
            audioConfig
        );
        console.log("SpeechRecognizer initialized:", recognizer.current);

        recognizer.current.recognizing = (s, e) => {
            console.log("Recognizing:", e.result.text);
        };
        recognizer.current.recognized = async (s, e) => {
            if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                console.log("Recognized:", e.result.text);
                const userMessage = e.result.text;
                setMessages((prev) => [
                    ...prev,
                    { sender: "user", text: userMessage },
                ]);
                try {
                    const response = await fetch("/api/ai-model", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            topic: DiscussionRoomData?.topic || "general",
                            coachingOption:
                                DiscussionRoomData?.coachingOption || "default",
                            msg: userMessage,
                        }),
                    });
                    if (!response.ok) {
                        console.error(
                            "AI Model API error:",
                            response.status,
                            response.statusText
                        );
                        setMessages((prev) => [
                            ...prev,
                            {
                                sender: "ai",
                                text: `Error: API returned ${response.status}`,
                            },
                        ]);
                        return;
                    }
                    const data = await response.json();
                    if (data.error) {
                        console.error("AI Model error:", data.error);
                        setMessages((prev) => [
                            ...prev,
                            { sender: "ai", text: `Error: ${data.error}` },
                        ]);
                    } else {
                        // Chuyển base64 thành Blob và tạo URL trên client-side
                        const audioBytes = atob(data.audioBase64);
                        const audioArray = new Uint8Array(audioBytes.length);
                        for (let i = 0; i < audioBytes.length; i++) {
                            audioArray[i] = audioBytes.charCodeAt(i);
                        }
                        const audioBlob = new Blob([audioArray], {
                            type: "audio/mp3",
                        });
                        const audioUrl = URL.createObjectURL(audioBlob);

                        setMessages((prev) => [
                            ...prev,
                            { sender: "ai", text: data.text, audioUrl },
                        ]);
                        if (audioRef.current && audioUrl) {
                            audioRef.current.src = audioUrl;
                            audioRef.current
                                .play()
                                .catch((err) =>
                                    console.error("Audio play error:", err)
                                );
                        }
                    }
                } catch (error) {
                    console.error("Error calling AI Model API:", error);
                    setMessages((prev) => [
                        ...prev,
                        {
                            sender: "ai",
                            text: "Error: Failed to connect to AI model",
                        },
                    ]);
                }
            } else {
                console.log(
                    "Recognized event, but no speech:",
                    e.result.reason
                );
            }
        };
        recognizer.current.sessionStarted = (s, e) => {
            console.log("Session started:", e);
        };
        recognizer.current.sessionStopped = (s, e) => {
            console.log("Session stopped:", e);
        };
        recognizer.current.canceled = (s, e) => {
            console.error("Recognition canceled:", e);
        };

        recognizer.current.startContinuousRecognitionAsync(
            () => console.log("Recognition started"),
            (err) => console.error("Recognition start error:", err)
        );
    };

    const stopRecording = () => {
        if (recognizer.current) {
            recognizer.current.stopContinuousRecognitionAsync(
                () => console.log("Recognition stopped"),
                (err) => console.error("Recognition stop error:", err)
            );
            recognizer.current = null;
        }
        setEnableMic(false);
    };

    return (
        <div className="-mt-12">
            <h2 className="text-lg font-bold">
                {DiscussionRoomData?.coachingOption}
            </h2>
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <div className="h-[60vh] bg-secondary rounded-4xl border flex flex-col items-center justify-center relative">
                        <Image
                            src={expert?.avatar}
                            alt="avatar"
                            width={200}
                            height={200}
                            className="h-[100px] w-[100px] rounded-full object-cover animate-pulse"
                        />
                        <h2 className="text-gray-500">{expert?.name}</h2>
                        <div className="p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10">
                            <UserButton />
                        </div>
                    </div>
                    <div className="mt-5 flex items-center justify-center">
                        {!enableMic ? (
                            <Button onClick={startRecording}>Connect</Button>
                        ) : (
                            <Button
                                variant="destructive"
                                onClick={stopRecording}
                            >
                                Disconnect
                            </Button>
                        )}
                    </div>
                </div>
                <div>
                    <div
                        ref={chatContainerRef}
                        className="h-[60vh] bg-white rounded-4xl border flex flex-col p-4 overflow-y-auto"
                    >
                        {messages.length === 0 ? (
                            <p className="text-gray-400 text-center mt-4">
                                No messages yet. Start the conversation!
                            </p>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${
                                        msg.sender === "user"
                                            ? "justify-end"
                                            : "justify-start"
                                    } mb-3`}
                                >
                                    <div
                                        className={`max-w-[70%] p-3 rounded-2xl ${
                                            msg.sender === "user"
                                                ? "bg-blue-500 text-white rounded-br-none"
                                                : "bg-gray-100 text-gray-800 rounded-bl-none"
                                        }`}
                                    >
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <audio ref={audioRef} />
                    <h2 className="mt-4 text-gray-400 text-sm">
                        At the end of your conversation we will automatically
                        generate feedback/notes from your conversation
                    </h2>
                </div>
            </div>
        </div>
    );
}

export default DiscussionRoom;
