"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { getToken } from "@/services/GlobalServices";
import { CoachingExpert } from "@/services/Options";
import { UserButton } from "@stackframe/stack";
import { RealtimeTranscriber } from "assemblyai";
import { useQuery } from "convex/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { use, useEffect, useRef, useState } from "react";
// import RecordRTC from "recordrtc";
const RecordRTC = dynamic(() => import("recordrtc"), { ssr: false });
function DiscussionRoom() {
    const { roomid } = useParams();
    const [expert, setExpert] = useState();
    const [enableMic, setEnableMic] = useState(false);
    const recorder = useRef(null);
    const realtimeTranscriber = useRef(null);
    let silenceTimeout;
    const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
        id: roomid,
    });
    console.log("DiscussionRoomData", DiscussionRoomData);
    useEffect(() => {
        if (DiscussionRoomData) {
            const Expert = CoachingExpert.find(
                (item) => item.name === DiscussionRoomData?.expertName
            );
            console.log("Expert", Expert);
            setExpert(Expert);
        }
    }, [DiscussionRoomData]);
    const connectToServer = async () => {
        setEnableMic(true);
        //Init AssemblyAI
        realtimeTranscriber.current = new RealtimeTranscriber({
            token: await getToken(),
            sample_rate: 16_000,
        });
        realtimeTranscriber.current.on("transcript", async (transcript) => {
            console.log("Transcript", transcript);
        });
        await realtimeTranscriber.current.connect();
        if (typeof window !== "undefined" && typeof navigator !== "undefined") {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((stream) => {
                    import("recordrtc").then((RecordRTCModule) => {
                        const RecordRTC =
                            RecordRTCModule.default || RecordRTCModule;
                        recorder.current = new RecordRTC(stream, {
                            type: "audio",
                            mimeType: "audio/webm; codecs=pcm",
                            recorderType: RecordRTC.StereoAudioRecorder,
                            timeSlice: 250,
                            desiredSampRate: 16000,
                            numberOfAudioChannels: 1,
                            bufferSize: 4096,
                            audioBitsPerSecond: 128000,
                            ondataavailable: async (blob) => {
                                if (!realtimeTranscriber.current) return;
                                clearTimeout(silenceTimeout);
                                const buffer = await blob.arrayBuffer();
                                console.log("Buffer", buffer);
                                realtimeTranscriber.current.sendAudio(buffer);
                                silenceTimeout = setTimeout(() => {
                                    console.log("User stopped talking");
                                }, 2000);
                            },
                        });
                        if (recorder.current) {
                            recorder.current.startRecording();
                        } else {
                            console.error("Failed to initialize RecordRTC");
                        }
                    });
                })
                .catch((err) =>
                    console.error("Error accessing microphone:", err)
                );
        }
    };

    const disconnect = async (e) => {
        e.preventDefault();
        if (realtimeTranscriber.current) {
            await realtimeTranscriber.current.close();
        } else {
            console.warn("realtimeTranscriber chưa được khởi tạo");
        }
        if (
            recorder.current &&
            typeof recorder.current.pauseRecording === "function"
        ) {
            recorder.current.pauseRecording();
            recorder.current = null;
            setEnableMic(false);
        } else {
            console.error(
                "Recorder chưa được khởi tạo hoặc pauseRecording không khả dụng"
            );
            setEnableMic(false);
        }
    };
    return (
        <div className="-mt-12">
            <h2 className="text-lg font-bold">
                {DiscussionRoomData?.coachingOption}
            </h2>
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-10 ">
                <div className="lg:col-span-2">
                    <div className=" h-[60vh] bg-secondary rounded-4xl border flex flex-col items-center justify-center relative">
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
                            <Button onClick={connectToServer}>Connect</Button>
                        ) : (
                            <Button variant="destructive" onClick={disconnect}>
                                Disconnect
                            </Button>
                        )}
                    </div>
                </div>
                <div>
                    <div className=" h-[60vh] bg-secondary rounded-4xl border flex flex-col items-center justify-center relative">
                        <h2>Chat Section</h2>
                    </div>
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
