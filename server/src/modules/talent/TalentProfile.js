import mongoose from "mongoose";

const talentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
      ref: "User",
    },
    talentType: {
      type: String,
      enum: ["instrumentalist", "backup_vocalist"],
      required: true,
    },
    instruments: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    yearsExperience: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    profilePhotoUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

export const TalentProfile = mongoose.model("TalentProfile", talentProfileSchema);
