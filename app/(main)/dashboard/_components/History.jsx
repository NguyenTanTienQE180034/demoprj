"use client";
import { UserContext } from "@/app/_context/UserContext";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { CoachingOptions } from "@/services/Options";
import { useConvex } from "convex/react";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import Link from "next/link";
function History() {
    const convex = useConvex();
    const { userData } = useContext(UserContext);
    const [discussionRoomList, setDiscussionRoomList] = useState([]);
    useEffect(() => {
        userData && GetDiscussionRooms();
    }, [userData]);
    const GetDiscussionRooms = async () => {
        const result = await convex.query(
            api.DiscussionRoom.GetAllDiscussionRoom,
            { uid: userData?._id }
        );
        console.log("result", result);
        setDiscussionRoomList(result);
    };
    const GetAbstractImages = (option) => {
        const coachingOption = CoachingOptions.find(
            (item) => item.name == option
        );
        return coachingOption?.abstract;
    };
    return (
        <div>
            <h2 className="font-bold text-xl">Your Previous Lecture</h2>
            {discussionRoomList?.length == 0 && (
                <h2 className="text-gray-500">
                    You don't have any previous lecture
                </h2>
            )}
            <div className="mt-5">
                {discussionRoomList.map(
                    (item, index) =>
                        item.coachingOption == "Topic Base Lecture" && (
                            <div
                                key={index}
                                className="border-b-[1px] pb-3 mb-4 group flex justify-between items-center cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex gap-7 items-center mt-5">
                                    <Image
                                        src={GetAbstractImages(
                                            item.coachingOption
                                        )}
                                        alt="abstract"
                                        width={70}
                                        height={70}
                                        className="rounded-full h-[50px] w-[50px]"
                                    />
                                    <div>
                                        <h2 className="font-bold">
                                            {item.topic}
                                        </h2>
                                        <h2 className="text-gray-500">
                                            {item.coachingOption}
                                        </h2>
                                        <h2 className="text-gray-500">
                                            {moment(
                                                item._creationTime
                                            ).fromNow()}
                                        </h2>
                                    </div>
                                </div>
                                <Link href={"/view-summary/" + item._id}>
                                    <Button
                                        varriant="outline"
                                        className="invisible group-hover:visible cursor-pointer"
                                    >
                                        View Notes
                                    </Button>
                                </Link>
                            </div>
                        )
                )}
            </div>
        </div>
    );
}

export default History;
