import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateNewRoom = mutation({
    args: {
        coachingOption: v.string(),
        topic: v.string(),
        expertName: v.string(),
        uid: v.id("users"),
    },
    handler: async (ctx, args) => {
        const results = await ctx.db.insert("DiscussionRooms", {
            coachingOption: args.coachingOption,
            topic: args.topic,
            expertName: args.expertName,
            uid: args.uid,
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
export const UpdateSummary = mutation({
    args: {
        id: v.id("DiscussionRooms"),
        summary: v.any(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            summary: args.summary,
        });
    },
});
export const GetAllDiscussionRoom = query({
    args: {
        uid: v.id("users"),
    },
    handler: async (ctx, args) => {
        const results = await ctx.db
            .query("DiscussionRooms")
            .filter((q) => q.eq(q.field("uid"), args.uid))
            .order("desc")
            .collect();
        return results;
    },
});
