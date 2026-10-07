import mongoose from "mongoose";
import {
  FREE_GIG_POSTING_FEE,
  MINIMUM_PAID_GIG_AMOUNT,
  PAID_GIG_POSTING_FEE,
} from "./gig.validation.js";

const paymentRangeSchema = new mongoose.Schema(
  {
    min: { type: Number, required: true, min: MINIMUM_PAID_GIG_AMOUNT, validate: Number.isInteger },
    max: { type: Number, required: true, validate: Number.isInteger },
  },
  { _id: false },
);

const positionSchema = new mongoose.Schema({
  roleType: {
    type: String,
    required: true,
    enum: ["instrumentalist", "backup_vocalist"],
  },
  instrument: { type: String, default: null, trim: true },
  slots: { type: Number, required: true, min: 1, validate: Number.isInteger },
  auditionSongs: {
    type: [{ type: String, trim: true }],
    required: true,
    validate: {
      validator: (songs) =>
        Array.isArray(songs) && songs.length === 3 && songs.every((song) => typeof song === "string" && song.trim().length > 0),
      message: "Each position must have exactly three non-empty audition songs.",
    },
  },
});

positionSchema.path("instrument").validate(function validateInstrument(instrument) {
  return this.roleType !== "instrumentalist" || Boolean(instrument?.trim());
}, "Instrumentalist positions require an instrument.");

const gigSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", index: true },
    title: { type: String, required: true, trim: true },
    eventType: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true },
    eventTime: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    applicationDeadline: { type: Date, required: true },
    gigType: { type: String, required: true, enum: ["free", "paid"] },
    paymentRange: { type: paymentRangeSchema, default: null },
    positions: {
      type: [positionSchema],
      required: true,
      validate: {
        validator: (positions) => Array.isArray(positions) && positions.length > 0,
        message: "A gig must have at least one required position.",
      },
    },
    postingFee: { type: Number, required: true, enum: [FREE_GIG_POSTING_FEE, PAID_GIG_POSTING_FEE] },
    postingPaymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
    publicationStatus: { type: String, enum: ["draft", "published", "cancelled", "completed"], default: "draft" },
  },
  { timestamps: true },
);

gigSchema.pre("validate", function enforceGigRules() {
  if (this.gigType === "free") {
    this.paymentRange = null;
    this.postingFee = FREE_GIG_POSTING_FEE;
  }

  if (this.gigType === "paid") {
    this.postingFee = PAID_GIG_POSTING_FEE;
    if (!this.paymentRange || this.paymentRange.min < MINIMUM_PAID_GIG_AMOUNT || this.paymentRange.max < this.paymentRange.min) {
      this.invalidate("paymentRange", "Paid gigs require a valid payment range with min at least 25000 and max at least min.");
    }
  }
});

export const Gig = mongoose.models.Gig || mongoose.model("Gig", gigSchema);
