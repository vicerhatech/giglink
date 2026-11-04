import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./user.model.js";
import { Gig } from "../gigs/gig.model.js";
import { Application } from "../applications/Application.js";
import { TalentProfile } from "../talent/TalentProfile.js";
import { Subscription } from "../payments/models/subscription.model.js";
import { AuthServiceError } from "../auth/auth.service.js";

export async function deleteOwnAccount(userId, { password, confirmation } = {}) {
  if (confirmation !== "DELETE" || typeof password !== "string" || !password) {
    throw new AuthServiceError("Enter your password and type DELETE to confirm.");
  }
  const user = await User.findById(userId).select("+passwordHash");
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    throw new AuthServiceError("Password is incorrect.", 401);
  }
  if (user.role === "admin") throw new AuthServiceError("Admin accounts cannot be deleted through self-service.", 403);
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const futureGigs = await Gig.find({ publicationStatus: "published", eventDate: { $gte: new Date() }, ...(user.role === "customer" ? { customerId: userId } : {}) }).select("_id").session(session);
      const commitments = await Application.exists({ gigId: { $in: futureGigs.map(gig => gig._id) }, status: "accepted", ...(user.role === "talent" ? { talentId: userId } : {}) }).session(session);
      if (commitments) throw new AuthServiceError("You have an upcoming accepted booking. Resolve that commitment before deleting your account.", 409);
      if (user.role === "customer") {
        const owned = await Gig.find({ customerId: userId }).select("_id").session(session);
        await Gig.updateMany({ customerId: userId, publicationStatus: { $in: ["draft", "published"] } }, { $set: { publicationStatus: "cancelled" } }, { session });
        await Application.updateMany({ gigId: { $in: owned.map(gig => gig._id) }, status: "pending" }, { $set: { status: "rejected" }, $unset: { activeApplicationKey: "" } }, { session });
      } else {
        await Application.updateMany({ talentId: userId, status: "pending" }, { $set: { status: "withdrawn" }, $unset: { activeApplicationKey: "" } }, { session });
      }
      await Subscription.updateMany({ talentId: userId, status: "active" }, { $set: { status: "cancelled", cancelledAt: new Date() } }, { session });
      await TalentProfile.deleteOne({ userId }, { session });
      await User.deleteOne({ _id: userId }, { session });
    });
  } finally { await session.endSession(); }
}
