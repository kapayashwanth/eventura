import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Emails that should automatically get admin role
const ADMIN_EMAILS = [
  "kapayashwanth8@gmail.com",
  "director@myamrita.me",
];

// ============ QUERIES ============

export const getByFirebaseUid = query({
  args: { firebase_uid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user_profiles")
      .withIndex("by_firebase_uid", (q) =>
        q.eq("firebase_uid", args.firebase_uid)
      )
      .first();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("user_profiles").collect();
    return profiles.sort(
      (a, b) =>
        new Date(b._creationTime).getTime() -
        new Date(a._creationTime).getTime()
    );
  },
});

export const getProfileFields = query({
  args: { firebase_uid: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("user_profiles")
      .withIndex("by_firebase_uid", (q) =>
        q.eq("firebase_uid", args.firebase_uid)
      )
      .first();

    if (!profile) return null;
    return {
      mobile_number: profile.mobile_number,
      department: profile.department,
      year_of_study: profile.year_of_study,
    };
  },
});

// ============ MUTATIONS ============

export const create = mutation({
  args: {
    firebase_uid: v.string(),
    full_name: v.string(),
    email: v.string(),
    mobile_number: v.optional(v.string()),
    department: v.optional(v.string()),
    year_of_study: v.optional(v.string()),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if profile already exists
    const existing = await ctx.db
      .query("user_profiles")
      .withIndex("by_firebase_uid", (q) =>
        q.eq("firebase_uid", args.firebase_uid)
      )
      .first();

    if (existing) return existing._id;

    // Auto-assign admin role for designated emails
    const role = ADMIN_EMAILS.includes(args.email.toLowerCase()) ? "admin" : args.role;

    const profileId = await ctx.db.insert("user_profiles", {
      ...args,
      role,
      profile_image: undefined,
      bio: undefined,
    });

    // Schedule welcome email (runs asynchronously)
    await ctx.scheduler.runAfter(0, internal.emails.sendWelcomeEmail, {
      email: args.email,
      fullName: args.full_name,
    });

    return profileId;
  },
});

export const update = mutation({
  args: {
    firebase_uid: v.string(),
    full_name: v.string(),
    mobile_number: v.optional(v.string()),
    department: v.optional(v.string()),
    year_of_study: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("user_profiles")
      .withIndex("by_firebase_uid", (q) =>
        q.eq("firebase_uid", args.firebase_uid)
      )
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    const { firebase_uid, ...data } = args;
    await ctx.db.patch(profile._id, data);
    return await ctx.db.get(profile._id);
  },
});

export const upsert = mutation({
  args: {
    firebase_uid: v.string(),
    full_name: v.string(),
    email: v.string(),
    mobile_number: v.optional(v.string()),
    department: v.optional(v.string()),
    year_of_study: v.optional(v.string()),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("user_profiles")
      .withIndex("by_firebase_uid", (q) =>
        q.eq("firebase_uid", args.firebase_uid)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        full_name: args.full_name,
        email: args.email,
      });
      return existing._id;
    }

    // Auto-assign admin role for designated emails
    const role = ADMIN_EMAILS.includes(args.email.toLowerCase()) ? "admin" : args.role;

    return await ctx.db.insert("user_profiles", {
      ...args,
      role,
      profile_image: undefined,
      bio: undefined,
    });
  },
});

export const setAdminByEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("user_profiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!profile) {
      return { success: false, message: `No user found with email ${args.email}` };
    }

    await ctx.db.patch(profile._id, { role: "admin" });
    return { success: true, message: `${args.email} is now an admin` };
  },
});
