import mongoose from "mongoose";
import { Application } from "./Application.js";

export const applicationRepository = {
  create(values, { session } = {}) {
    return Application.create([values], { session }).then(([application]) => application);
  },

  findActive(gigId, positionId, talentId, { session } = {}) {
    return Application.findOne({
      gigId,
      positionId,
      talentId,
      status: { $in: ["pending", "accepted"] },
    }).session(session);
  },

  findById(applicationId, { session } = {}) {
    return Application.findById(applicationId).session(session);
  },

  findByGigId(gigId, { session } = {}) {
    return Application.find({ gigId }).sort({ createdAt: -1 }).session(session);
  },

  findByTalentId(talentId, { session } = {}) {
    return Application.find({ talentId }).sort({ createdAt: -1 }).session(session);
  },

  findAcceptedForTalent(talentId, { session } = {}) {
    return Application.find({ talentId, status: "accepted" }).session(session);
  },

  countAcceptedForPosition(gigId, positionId, { session } = {}) {
    return Application.countDocuments({ gigId, positionId, status: "accepted" }).session(session);
  },

  setStatusIfPending(applicationId, status, { session } = {}) {
    const update = { $set: { status } };
    if (["rejected", "withdrawn"].includes(status)) update.$unset = { activeApplicationKey: 1 };
    return Application.findOneAndUpdate(
      { _id: applicationId, status: "pending" },
      update,
      { new: true, runValidators: true, session },
    );
  },

  async withTransaction(operation) {
    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
        result = await operation({ session });
      });
      return result;
    } finally {
      await session.endSession();
    }
  },
};
