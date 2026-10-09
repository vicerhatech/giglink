import mongoose from "mongoose";

export const PAYMENT_PURPOSES = [
  "free_gig_post",
  "paid_gig_post",
  "talent_subscription",
];

export const PAYMENT_STATUSES = ["initialized", "successful", "failed"];

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Gig",
    },
    purpose: {
      type: String,
      required: true,
      enum: PAYMENT_PURPOSES,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "initialized",
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const Payment = mongoose.model("Payment", paymentSchema);
