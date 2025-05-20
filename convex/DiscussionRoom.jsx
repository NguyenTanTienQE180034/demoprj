import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateNewRoom = mutation({
    args: {
        coachingOption: v.string(),
        topic: v.string(),
        expertName: v.string(),
    },
    handler: async (ctx, args) => {
        const results = await ctx.db.insert("DiscussionRooms", {
            coachingOption: args.coachingOption,
            topic: args.topic,
            expertName: args.expertName,
        });
        return results;
    },
});
export const GetDiscussionRoom = query({
    args: {
        id: v.id("DiscussionRooms"),
    },
    handler: async (ctx, args) => {
        const results = await ctx.db.get(args.id);
        return results;
    },
});
export const UpdateConversationId = mutation({
    args: {
        id: v.id("DiscussionRooms"),
        conversationId: v.any(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            conversationId: args.conversationId,
        });
    },
});
