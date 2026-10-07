import mongoose from "mongoose";

const demoVideoSchema = new mongoose.Schema(
  {
    songTitle: { type: String, required: true, trim: true },
    videoUrl: { type: String, required: true, trim: true },
    cloudinaryPublicId: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const applicationSchema = new mongoose.Schema(
  {
    gigId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: "Gig" },
    positionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    talentId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: "User" },
    demoVideos: {
      type: [demoVideoSchema],
      required: true,
      validate: {
        validator: (videos) => videos.length === 3,
        message: "An application must contain exactly three demo videos.",
      },
    },
    note: { type: String, default: "", trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
      required: true,
    },
    // Present while an application is pending or accepted. The partial unique
    // index keeps the active-application business rule database-enforced.
    activeApplicationKey: { type: String, select: false },
  },
  { timestamps: true },
);

applicationSchema.index(
  { activeApplicationKey: 1 },
  { unique: true, partialFilterExpression: { activeApplicationKey: { $type: "string" } } },
);

export const Application = mongoose.model("Application", applicationSchema);
