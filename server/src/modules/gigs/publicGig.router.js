import { Router } from "express";
import { Gig } from "./gig.model.js";
import { buildEventRoleFilter } from "./event-role-filter.js";

// Public previews deliberately exclude exact location, owner identity, payment
// records, compensation, descriptions, and audition/application details.
export function createPublicGigRouter({ model = Gig } = {}) {
  const router = Router();
  router.get("/:id", async (request, response, next) => {
    try {
      if (!/^[a-f\d]{24}$/i.test(request.params.id)) return response.status(400).json({ success: false, message: "Invalid event ID.", errors: [] });
      const row = await model.findOne({ _id: request.params.id, publicationStatus: "published" }).select("title eventType eventDate gigType positions.roleType positions.instrument").lean();
      if (!row) return response.status(404).json({ success: false, message: "This event is not publicly available.", errors: [] });
      const gig = { _id: row._id, title: row.title, eventType: row.eventType, eventDate: row.eventDate, gigType: row.gigType, roles: [...new Set((row.positions || []).map(position => position.roleType === "backup_vocalist" ? "Backup vocalist" : position.instrument || "Instrumentalist"))] };
      return response.json({ success: true, message: "Public event preview retrieved.", data: { gig } });
    } catch (error) { return next(error); }
  });
  router.get("/", async (request, response, next) => {
    try {
      const page = Math.max(1, Math.min(100000, Number.parseInt(request.query.page, 10) || 1));
      const limit = 12;
      const filter = { publicationStatus: "published", ...buildEventRoleFilter(request.query) };
      if (["free", "paid"].includes(request.query.type)) filter.gigType = request.query.type;
      const [rows, total] = await Promise.all([
        model.find(filter).select("title eventType eventDate gigType positions.roleType positions.instrument").sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        model.countDocuments(filter),
      ]);
      const gigs = rows.map((row) => ({
        _id: row._id,
        title: row.title,
        eventType: row.eventType,
        eventDate: row.eventDate,
        gigType: row.gigType,
        roles: [...new Set((row.positions || []).map((position) => position.roleType === "backup_vocalist" ? "Backup vocalist" : position.instrument || "Instrumentalist"))],
      }));
      response.json({ success: true, message: "Published event previews retrieved.", data: { gigs, page, total, pages: Math.ceil(total / limit) } });
    } catch (error) { next(error); }
  });
  return router;
}
