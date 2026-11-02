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
    profilePhotoPublicId: {
      type: String,
      default: "",
      trim: true,
    },
    genres: {
      type: [String],
      default: [],
      validate: {
        validator: (genres) => Array.isArray(genres) && genres.length <= 12 && genres.every((genre) => genre.length <= 80),
        message: "Provide up to 12 genres, each no longer than 80 characters.",
      },
    },
    city: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
  },
  { timestamps: true },
);

export const TalentProfile = mongoose.model("TalentProfile", talentProfileSchema);
