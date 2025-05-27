import { UserContext } from "@/app/_context/UserContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@stackframe/stack";
import { Wallet2 } from "lucide-react";
import Image from "next/image";
import React, { useContext } from "react";

function Credits() {
    const user = useUser();
    const CalcualteProgress = () => {
        if (userData?.subscriptionId) {
            return 50000 - Number(userData?.credits);
        }
    };
    const { userData } = useContext(UserContext);
    return (
        <div>
            <div className="flex  items-center gap-5">
                <Image
                    src={user?.profileImageUrl}
                    alt="profile"
                    width={100}
                    height={100}
                    className="rounded-full"
                />
                <div>
                    <h2 className="font-bold text-lg">{user?.displayName}</h2>
                    <h2 className="text-gray-500">{user?.primaryEmail}</h2>
                </div>
            </div>
            <hr className="my-3"></hr>
            <div>
                <h2 className="font-bold text-lg">Token Usage</h2>
                <h2>
                    {userData.credits}/
                    {userData?.subscriptionId ? "50.000" : "5000"}
                </h2>
                <Progress value={33} className="my-3"></Progress>
                <div className="flex justify-between items-center mt-3 ">
                    <h2 className="font-bold text-lg">Current Plan</h2>
                    <h2 className="p-1 bg-secondary rounded-lg px-2">
                        Free Plan
                    </h2>
                </div>
                <div className="mt-5 p-5 border-rounded-2xl bg-white shadow-sm">
                    <div className="flex justify-between items-center mt-3 ">
                        <div>
                            <h2>Pro Plan</h2>
                            <h2>50.000 Tokens</h2>
                        </div>
                        <h2 className="font-bold">$10/Month</h2>
                    </div>
                    <hr className="my-3"></hr>
                    <Button className="w-full">
                        <Wallet2 />
                        Upgrade $10
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Credits;
