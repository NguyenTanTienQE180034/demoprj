import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        credits: v.number(),
        subcriptionId: v.optional(v.string()),
    }),
    DiscussionRooms: defineTable({
        coachingOption: v.string(),
        topic: v.string(),
        expertName: v.string(),
        conversationId: v.optional(v.any()),
        summary: v.optional(v.any()),
        uid: v.optional(v.id("users")),
    }),
});
