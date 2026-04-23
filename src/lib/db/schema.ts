import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

// Users Table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("admin"),
  avatar: text("avatar"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Blog Posts Table
export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  tags: text("tags"), // JSON string array
  published: integer("published", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  images: text("images"), // JSON string array
}, (table) => ([
  index("idx_posts_published").on(table.published, table.createdAt),
  index("idx_posts_slug").on(table.slug),
]));

// Comments Table
export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  postSlug: text("post_slug").notNull(),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email"),
  authorAvatar: text("author_avatar"),
  content: text("content").notNull(),
  parentId: text("parent_id").references((): any => comments.id),
  status: text("status").default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (table) => ([
  index("idx_comments_status").on(table.status),
  index("idx_comments_parent").on(table.parentId),
  index("idx_comments_post").on(table.postSlug, table.createdAt),
]));

// Reactions Table
export const reactions = sqliteTable("reactions", {
  id: text("id").primaryKey(),
  commentId: text("comment_id").notNull().references(() => comments.id),
  userId: text("user_id"),
  type: text("type").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Post Likes Table
export const postLikes = sqliteTable("post_likes", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => posts.id),
  userId: text("user_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (table) => ([
  index("idx_post_likes_user").on(table.userId, table.postId),
  index("idx_post_likes_post").on(table.postId),
]));

// Resources Table
export const resources = sqliteTable("resources", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  publicId: text("public_id").notNull(),
  category: text("category").default("general"),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (table) => ([
  index("idx_resources_category").on(table.category, table.createdAt),
]));

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type PostLike = typeof postLikes.$inferSelect;
export type NewPostLike = typeof postLikes.$inferInsert;
export type Reaction = typeof reactions.$inferSelect;
export type User = typeof users.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
