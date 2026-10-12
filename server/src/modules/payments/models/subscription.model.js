import mongoose from "mongoose";
import { TALENT_SUBSCRIPTION_FEE } from "../services/payment-policy.service.js";

export const SUBSCRIPTION_AMOUNT = TALENT_SUBSCRIPTION_FEE;

const subscriptionSchema = new mongoose.Schema(
  {
    talentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
      default: SUBSCRIPTION_AMOUNT,
      immutable: true,
      min: SUBSCRIPTION_AMOUNT,
      max: SUBSCRIPTION_AMOUNT,
    },
    paymentReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "expired"],
      default: "active",
    },
    startsAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

subscriptionSchema.index({ talentId: 1, status: 1, expiresAt: 1 });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
