"use client";
import { api } from "@/convex/_generated/api";
import { CoachingOptions } from "@/services/Options";
import { useQuery } from "convex/react";
import moment from "moment";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useRef } from "react";

function ViewSummary() {
    const { roomid } = useParams();
    const chatContainerRef = useRef(null);
    const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
        id: roomid,
    });

    const GetAbstractImages = (option) => {
        const coachingOption = CoachingOptions.find(
            (item) => item.name === option
        );
        return coachingOption?.abstract;
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [DiscussionRoomData]);

    return (
        <div>
            <div className="flex justify-between items-end">
                <div className="flex gap-7 items-center mt-5">
                    <Image
                        src={GetAbstractImages(
                            DiscussionRoomData?.coachingOption
                        )}
                        alt="Abstract image"
                        width={100}
                        height={100}
                        className="w-[70px] h-[70px] rounded-full"
                    />
                    <div>
                        <h2 className="font-bold text-lg">
                            {DiscussionRoomData?.topic}
                        </h2>
                        <h2 className="text-gray-500">
                            {DiscussionRoomData?.coachingOption}
                        </h2>
                    </div>
                </div>
                <h2 className="text-gray-500">
                    {moment(DiscussionRoomData?._creationTime).fromNow()}
                </h2>
            </div>
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                    <h3 className="font-bold text-lg">Conversation History</h3>
                    <div
                        ref={chatContainerRef}
                        className="h-[60vh] bg-white rounded-4xl border flex flex-col p-4 overflow-y-auto"
                    >
                        {DiscussionRoomData?.conversationId?.length === 0 ? (
                            <p className="text-gray-400 text-center mt-4">
                                No messages in this conversation.
                            </p>
                        ) : (
                            DiscussionRoomData?.conversationId?.map(
                                (msg, index) => (
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
                                                    : msg.sender === "system"
                                                      ? "bg-red-100 text-red-800 rounded-bl-none"
                                                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                                            }`}
                                        >
                                            <p>{msg.text}</p>
                                        </div>
                                    </div>
                                )
                            )
                        )}
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-lg">Feedback & Notes</h3>
                    <div className="h-[60vh] bg-green-100 rounded-4xl border flex flex-col p-4 overflow-y-auto">
                        {DiscussionRoomData?.summary ? (
                            <p className="whitespace-pre-wrap">
                                {DiscussionRoomData.summary}
                            </p>
                        ) : (
                            <p className="text-gray-400 text-center mt-4">
                                No feedback available for this conversation.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewSummary;
