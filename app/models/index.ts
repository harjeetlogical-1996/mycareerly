/**
 * Mongoose models for MyCareerly.
 *
 * Schema mirrors the previous Prisma schema 1:1 so the rest of the codebase
 * can keep working with the same field names. JSON-string fields (tags,
 * images, hours, faqs) stay as strings — they were already denormalized in
 * Postgres and changing them now would force every consumer to change too.
 *
 * `id` (string, cuid-style) is preserved as the primary key for backwards
 * compat with existing slugs, links, and cached client state. MongoDB's
 * native `_id` ObjectId is unused.
 */
import mongoose, { Schema, Model, models, model } from "mongoose";

// Stable cuid-style id generator (replaces Prisma's @default(cuid()))
function cuid(): string {
  return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// Shared options: keep default Mongo ObjectId for _id, expose our own `id`
// string field as the app-visible primary key. timestamps + drop versionKey.
const baseOpts = {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: false },
  toObject: { virtuals: false },
};

// ── Article ──────────────────────────────────────────────────────────────────
const ArticleSchema = new Schema({
  id:              { type: String, default: cuid, unique: true, index: true },
  slug:            { type: String, required: true, unique: true, index: true },
  title:           { type: String, required: true },
  excerpt:         { type: String, default: "" },
  content:         { type: String, required: true },
  coverImage:      { type: String, default: "" },
  category:        { type: String, required: true, index: true },
  tags:            { type: String, default: "[]" },
  authorName:      { type: String, required: true },
  authorBio:       { type: String, default: "" },
  authorEmail:     { type: String, default: "" },
  status:          { type: String, default: "pending", index: true },
  featured:        { type: Boolean, default: false },
  readTime:        { type: String, default: "5 min read" },
  publishedAt:     { type: String, default: "" },
  metaTitle:       { type: String, default: "" },
  metaDescription: { type: String, default: "" },
  keywords:        { type: String, default: "" },
  faqs:            { type: String, default: "[]" },
}, baseOpts);

// ── Author ───────────────────────────────────────────────────────────────────
const AuthorSchema = new Schema({
  id:        { type: String, default: cuid, unique: true, index: true },
  slug:      { type: String, required: true, unique: true, index: true },
  name:      { type: String, required: true },
  bio:       { type: String, default: "" },
  avatar:    { type: String, default: "" },
  email:     { type: String, default: "" },
  specialty: { type: String, default: "" },
  twitter:   { type: String, default: "" },
  instagram: { type: String, default: "" },
  website:   { type: String, default: "" },
  active:    { type: Boolean, default: true },
}, baseOpts);

// ── Category ─────────────────────────────────────────────────────────────────
const CategorySchema = new Schema({
  id:          { type: String, default: cuid, unique: true, index: true },
  name:        { type: String, required: true, unique: true },
  slug:        { type: String, required: true, unique: true, index: true },
  description: { type: String, default: "" },
  color:       { type: String, default: "#E8705A" },
  order:       { type: Number, default: 0 },
  active:      { type: Boolean, default: true },
}, baseOpts);

// ── City ─────────────────────────────────────────────────────────────────────
const CitySchema = new Schema({
  id:              { type: String, default: cuid, unique: true, index: true },
  slug:            { type: String, required: true, unique: true, index: true },
  name:            { type: String, required: true },
  state:           { type: String, required: true, index: true },
  stateFull:       { type: String, default: "" },
  coverImage:      { type: String, default: "" },
  heroImage:       { type: String, default: "" },
  description:     { type: String, default: "" },
  shortDesc:       { type: String, default: "" },
  metaTitle:       { type: String, default: "" },
  metaDescription: { type: String, default: "" },
  keywords:        { type: String, default: "" },
  featured:        { type: Boolean, default: false },
  active:          { type: Boolean, default: true },
  order:           { type: Number, default: 0 },
}, baseOpts);

// ── ScheduledArticle ─────────────────────────────────────────────────────────
const ScheduledArticleSchema = new Schema({
  id:                 { type: String, default: cuid, unique: true, index: true },
  title:              { type: String, required: true },
  reference:          { type: String, default: "" },
  category:           { type: String, default: "Care Guide" },
  authorName:         { type: String, default: "MyCareerly Editorial" },
  scheduledFor:       { type: Date, required: true, index: true },
  status:             { type: String, default: "pending", index: true },
  generatedArticleId: { type: String, default: null },
  errorMessage:       { type: String, default: "" },
}, baseOpts);

// ── Setting ─────────────────────────────────────────────────────────────────
// Uses `key` as primary id — no separate cuid.
const SettingSchema = new Schema({
  key:   { type: String, required: true, unique: true, index: true },
  value: { type: String, default: "" },
}, { timestamps: { createdAt: false, updatedAt: true }, versionKey: false });

// ── AdminUser ───────────────────────────────────────────────────────────────
const AdminUserSchema = new Schema({
  id:           { type: String, default: cuid, unique: true, index: true },
  email:        { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  name:         { type: String, default: "" },
  role:         { type: String, default: "editor" },
  active:       { type: Boolean, default: true, index: true },
  lastLoginAt:  { type: Date, default: null },
}, baseOpts);
AdminUserSchema.index({ email: 1, active: 1 });

// ── Subscriber ──────────────────────────────────────────────────────────────
const SubscriberSchema = new Schema({
  id:     { type: String, default: cuid, unique: true, index: true },
  email:  { type: String, required: true, unique: true, lowercase: true, index: true },
  name:   { type: String, default: "" },
  source: { type: String, default: "newsletter" },
  active: { type: Boolean, default: true },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

// ── ContactMessage ──────────────────────────────────────────────────────────
const ContactMessageSchema = new Schema({
  id:      { type: String, default: cuid, unique: true, index: true },
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false, index: true },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

// ── Review ──────────────────────────────────────────────────────────────────
const ReviewSchema = new Schema({
  id:          { type: String, default: cuid, unique: true, index: true },
  listingId:   { type: String, required: true, index: true },
  authorName:  { type: String, required: true },
  authorEmail: { type: String, required: true },
  rating:      { type: Number, required: true, min: 1, max: 5 },
  title:       { type: String, default: "" },
  body:        { type: String, required: true },
  helpful:     { type: Number, default: 0 },
  status:      { type: String, default: "pending", index: true },
  ipHash:      { type: String, default: "" },
}, baseOpts);
ReviewSchema.index({ listingId: 1, status: 1 });
ReviewSchema.index({ status: 1, createdAt: -1 });

// ── PinterestAccount ────────────────────────────────────────────────────────
const PinterestAccountSchema = new Schema({
  id:              { type: String, default: cuid, unique: true, index: true },
  username:        { type: String, required: true, unique: true, index: true },
  label:           { type: String, default: "" },
  accessToken:     { type: String, required: true },
  refreshToken:    { type: String, required: true },
  tokenExpiresAt:  { type: Date, required: true },
  defaultBoardId:  { type: String, default: "" },
  autoPostEnabled: { type: Boolean, default: false },
  active:          { type: Boolean, default: true, index: true },
}, baseOpts);

// ── PinterestPin ────────────────────────────────────────────────────────────
const PinterestPinSchema = new Schema({
  id:           { type: String, default: cuid, unique: true, index: true },
  accountId:    { type: String, required: true, index: true },
  articleId:    { type: String, required: true, index: true },
  imageId:      { type: String, default: null },
  title:        { type: String, required: true },
  description:  { type: String, default: "" },
  hashtags:     { type: String, default: "" },
  boardId:      { type: String, required: true },
  pinId:        { type: String, default: null },
  status:       { type: String, default: "draft", index: true },
  scheduledFor: { type: Date, default: null },
  postedAt:     { type: Date, default: null },
  attempts:     { type: Number, default: 0 },
  lastError:    { type: String, default: "" },
}, baseOpts);
PinterestPinSchema.index({ status: 1, scheduledFor: 1 });
PinterestPinSchema.index({ accountId: 1, status: 1 });

// ── PinterestImage ──────────────────────────────────────────────────────────
const PinterestImageSchema = new Schema({
  id:        { type: String, default: cuid, unique: true, index: true },
  articleId: { type: String, required: true, index: true },
  url:       { type: String, required: true },
  source:    { type: String, default: "upload" },
  prompt:    { type: String, default: "" },
  width:     { type: Number, default: 0 },
  height:    { type: Number, default: 0 },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

// ── PinterestBoardMap ───────────────────────────────────────────────────────
const PinterestBoardMapSchema = new Schema({
  id:        { type: String, default: cuid, unique: true, index: true },
  accountId: { type: String, required: true, index: true },
  category:  { type: String, required: true },
  boardId:   { type: String, required: true },
  boardName: { type: String, default: "" },
}, { timestamps: false, versionKey: false });
PinterestBoardMapSchema.index({ accountId: 1, category: 1 }, { unique: true });

// ── Listing ─────────────────────────────────────────────────────────────────
const ListingSchema = new Schema({
  id:                { type: String, default: cuid, unique: true, index: true },
  slug:              { type: String, required: true, unique: true, index: true },
  name:              { type: String, required: true, index: "text" },
  tagline:           { type: String, default: "" },
  description:       { type: String, required: true },
  address:           { type: String, required: true },
  city:              { type: String, required: true, index: true },
  pincode:           { type: String, default: "" },
  phone:             { type: String, default: "" },
  email:             { type: String, default: "" },
  website:           { type: String, default: "" },
  rating:            { type: Number, default: 0 },
  reviewCount:       { type: Number, default: 0 },
  images:            { type: String, default: "[]" },
  categories:        { type: String, default: "[]" },
  tags:              { type: String, default: "[]" },
  hours:             { type: String, default: "[]" },
  open:              { type: Boolean, default: true },
  verified:          { type: Boolean, default: false },
  featured:          { type: Boolean, default: false },
  established:       { type: String, default: "" },
  priceRange:        { type: String, default: "mid" },
  deliveryAvailable: { type: Boolean, default: false },
  status:            { type: String, default: "pending", index: true },
  state:             { type: String, default: "", index: true },
  citySlug:          { type: String, default: "", index: true },
  sponsored:         { type: Boolean, default: false },
  sortOrder:         { type: Number, default: 0 },
  submittedBy:       { type: String, default: "admin" },
  showEmail:         { type: Boolean, default: false },
  googlePlaceId:     { type: String, default: "" },
}, baseOpts);

// ── Type aliases — preserved so existing code's TS shapes don't change ──────
export type ArticleDoc            = mongoose.InferSchemaType<typeof ArticleSchema>;
export type AuthorDoc             = mongoose.InferSchemaType<typeof AuthorSchema>;
export type CategoryDoc           = mongoose.InferSchemaType<typeof CategorySchema>;
export type CityDoc               = mongoose.InferSchemaType<typeof CitySchema>;
export type ScheduledArticleDoc   = mongoose.InferSchemaType<typeof ScheduledArticleSchema>;
export type SettingDoc            = mongoose.InferSchemaType<typeof SettingSchema>;
export type AdminUserDoc          = mongoose.InferSchemaType<typeof AdminUserSchema>;
export type SubscriberDoc         = mongoose.InferSchemaType<typeof SubscriberSchema>;
export type ContactMessageDoc     = mongoose.InferSchemaType<typeof ContactMessageSchema>;
export type ReviewDoc             = mongoose.InferSchemaType<typeof ReviewSchema>;
export type PinterestAccountDoc   = mongoose.InferSchemaType<typeof PinterestAccountSchema>;
export type PinterestPinDoc       = mongoose.InferSchemaType<typeof PinterestPinSchema>;
export type PinterestImageDoc     = mongoose.InferSchemaType<typeof PinterestImageSchema>;
export type PinterestBoardMapDoc  = mongoose.InferSchemaType<typeof PinterestBoardMapSchema>;
export type ListingDoc            = mongoose.InferSchemaType<typeof ListingSchema>;

// ── Model exports — use `models.X || model(...)` so Next.js hot reload doesn't
//    re-register and throw OverwriteModelError. ────────────────────────────
export const Article: Model<ArticleDoc> =
  (models.Article as Model<ArticleDoc>) || model<ArticleDoc>("Article", ArticleSchema);

export const Author: Model<AuthorDoc> =
  (models.Author as Model<AuthorDoc>) || model<AuthorDoc>("Author", AuthorSchema);

export const Category: Model<CategoryDoc> =
  (models.Category as Model<CategoryDoc>) || model<CategoryDoc>("Category", CategorySchema);

export const City: Model<CityDoc> =
  (models.City as Model<CityDoc>) || model<CityDoc>("City", CitySchema);

export const ScheduledArticle: Model<ScheduledArticleDoc> =
  (models.ScheduledArticle as Model<ScheduledArticleDoc>) || model<ScheduledArticleDoc>("ScheduledArticle", ScheduledArticleSchema);

export const Setting: Model<SettingDoc> =
  (models.Setting as Model<SettingDoc>) || model<SettingDoc>("Setting", SettingSchema);

export const AdminUser: Model<AdminUserDoc> =
  (models.AdminUser as Model<AdminUserDoc>) || model<AdminUserDoc>("AdminUser", AdminUserSchema);

export const Subscriber: Model<SubscriberDoc> =
  (models.Subscriber as Model<SubscriberDoc>) || model<SubscriberDoc>("Subscriber", SubscriberSchema);

export const ContactMessage: Model<ContactMessageDoc> =
  (models.ContactMessage as Model<ContactMessageDoc>) || model<ContactMessageDoc>("ContactMessage", ContactMessageSchema);

export const Review: Model<ReviewDoc> =
  (models.Review as Model<ReviewDoc>) || model<ReviewDoc>("Review", ReviewSchema);

export const PinterestAccount: Model<PinterestAccountDoc> =
  (models.PinterestAccount as Model<PinterestAccountDoc>) || model<PinterestAccountDoc>("PinterestAccount", PinterestAccountSchema);

export const PinterestPin: Model<PinterestPinDoc> =
  (models.PinterestPin as Model<PinterestPinDoc>) || model<PinterestPinDoc>("PinterestPin", PinterestPinSchema);

export const PinterestImage: Model<PinterestImageDoc> =
  (models.PinterestImage as Model<PinterestImageDoc>) || model<PinterestImageDoc>("PinterestImage", PinterestImageSchema);

export const PinterestBoardMap: Model<PinterestBoardMapDoc> =
  (models.PinterestBoardMap as Model<PinterestBoardMapDoc>) || model<PinterestBoardMapDoc>("PinterestBoardMap", PinterestBoardMapSchema);

export const Listing: Model<ListingDoc> =
  (models.Listing as Model<ListingDoc>) || model<ListingDoc>("Listing", ListingSchema);
