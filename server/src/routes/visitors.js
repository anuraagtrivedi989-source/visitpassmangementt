import { Router } from "express";
import Visitor from "../models/Visitor.js";
import Pass from "../models/Pass.js";
import CheckLog from "../models/CheckLog.js";
import Appointment from "../models/Appointment.js";
import { createPassId } from "../utils/passId.js";
import { allowRoles } from "../middleware/auth.js";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import { sendVisitorNotification } from "../services/notifications.js";
import Organization from "../models/Organization.js";
const router = Router();

router.get(
  "/",
  allowRoles("admin", "security", "frontdesk"),
  async (req, res, next) => {
    try {
      const search = String(req.query.search || "")
          .trim()
          .slice(0, 100),
        status = String(req.query.status || "").trim(),
        filter = { organizationId: req.admin.organizationId };
      if (
        status &&
        [
          "scheduled",
          "checked-in",
          "checked-out",
          "expired",
          "revoked",
        ].includes(status)
      )
        filter.status = status;
      if (search)
        filter.$and = [
          { organizationId: req.admin.organizationId },
          {
            $or: [
              { fullName: { $regex: esc(search), $options: "i" } },
              { passId: { $regex: esc(search), $options: "i" } },
              { phone: { $regex: esc(search), $options: "i" } },
              { hostName: { $regex: esc(search), $options: "i" } },
            ],
          },
        ];
      const visitors = await Visitor.find(filter)
        .sort({ createdAt: -1 })
        .limit(300)
        .lean();
      res.json({ visitors });
    } catch (e) {
      next(e);
    }
  },
);
router.post("/", allowRoles("admin", "frontdesk"), async (req, res, next) => {
  try {
    for (const f of ["fullName", "phone", "purpose", "hostName", "visitDate"])
      if (!String(req.body[f] ?? "").trim())
        return res.status(400).json({ message: `${f} is required.` });
    const date = new Date(req.body.visitDate);
    if (Number.isNaN(date.getTime()))
      return res.status(400).json({ message: "Visit date is invalid." });
    const passId = createPassId();
    const visitor = await Visitor.create({
      organizationId: req.admin.organizationId,
      passId,
      fullName: String(req.body.fullName).trim(),
      phone: String(req.body.phone).trim(),
      email: String(req.body.email || "")
        .trim()
        .toLowerCase(),
      photoUrl: String(req.body.photoUrl || ""),
      organization: String(req.body.organization || "").trim(),
      purpose: String(req.body.purpose).trim(),
      hostName: String(req.body.hostName).trim(),
      visitDate: date,
      createdBy: req.admin._id,
    });
    await Pass.create({
      organizationId: req.admin.organizationId,
      visitorId: visitor._id,
      passId,
      qrPayload: JSON.stringify({
        passId,
        organizationId: String(req.admin.organizationId),
      }),
      validFrom: new Date(date.setHours(0, 0, 0, 0)),
      validUntil: new Date(date.setHours(23, 59, 59, 999)),
      issuedBy: req.admin._id,
    });
    const org = await Organization.findById(req.admin.organizationId).select(
      "name",
    );
    const notifications = await sendVisitorNotification({
      email: visitor.email,
      phone: visitor.phone,
      visitor,
      organizationName: org?.name || "VisitPass",
    });
    res.status(201).json({
      visitor,
      pass: {
        passId,
        qrPayload: JSON.stringify({
          passId,
          organizationId: String(req.admin.organizationId),
        }),
      },
      notifications,
    });
  } catch (e) {
    next(e);
  }
});
router.post(
  "/verify",
  allowRoles("admin", "security", "frontdesk"),
  async (req, res, next) => {
    try {
      const passId = String(req.body.passId || "").trim();
      if (!passId)
        return res
          .status(400)
          .json({ valid: false, message: "Pass ID is required." });
      const visitor = await Visitor.findOne({
        passId,
        organizationId: req.admin.organizationId,
      });
      const pass = await Pass.findOne({
        passId,
        organizationId: req.admin.organizationId,
      });
      if (!visitor || !pass || pass.revokedAt)
        return res
          .status(404)
          .json({ valid: false, message: "Pass not found or revoked." });
      const now = new Date(),
        sameDay =
          now.toDateString() === new Date(visitor.visitDate).toDateString(),
        valid =
          sameDay &&
          visitor.status === "scheduled" &&
          pass.validFrom <= now &&
          pass.validUntil >= now;
      await CheckLog.create({
        organizationId: req.admin.organizationId,
        visitorId: visitor._id,
        passId,
        action: valid ? "verify" : "rejected",
        actorId: req.admin._id,
        note: valid
          ? "Pass verified"
          : `Verification failed: ${visitor.status}`,
      });
      res.json({
        valid,
        visitor,
        message: valid
          ? "Pass is valid for check-in."
          : `Pass is not currently valid (status: ${visitor.status}).`,
      });
    } catch (e) {
      next(e);
    }
  },
);
router.get(
  "/:id",
  allowRoles("admin", "security", "frontdesk"),
  async (req, res, next) => {
    try {
      const q = {
        organizationId: req.admin.organizationId,
        $or: [
          { _id: /^[a-f\d]{24}$/i.test(req.params.id) ? req.params.id : null },
          { passId: req.params.id },
        ],
      };
      const visitor = await Visitor.findOne(q);
      if (!visitor)
        return res.status(404).json({ message: "Visitor pass not found." });
      const pass = await Pass.findOne({
        passId: visitor.passId,
        organizationId: req.admin.organizationId,
      });
      res.json({ visitor, pass });
    } catch (e) {
      next(e);
    }
  },
);
router.post(
  "/:id/check-in",
  allowRoles("admin", "security", "frontdesk"),
  async (req, res, next) => {
    try {
      const visitor = await Visitor.findOne({
        _id: req.params.id,
        organizationId: req.admin.organizationId,
      });
      if (!visitor)
        return res.status(404).json({ message: "Visitor pass not found." });
      if (visitor.status !== "scheduled")
        return res.status(409).json({
          message: `Cannot check in pass with status ${visitor.status}.`,
        });
      if (
        new Date(visitor.visitDate).toDateString() !== new Date().toDateString()
      )
        return res.status(409).json({
          message: "Check-in is only allowed on the scheduled visit date.",
        });
      visitor.status = "checked-in";
      visitor.checkedInAt = new Date();
      await visitor.save();
      await CheckLog.create({
        organizationId: req.admin.organizationId,
        visitorId: visitor._id,
        passId: visitor.passId,
        action: "check-in",
        actorId: req.admin._id,
      });
      res.json({ visitor, message: "Visitor checked in successfully." });
    } catch (e) {
      next(e);
    }
  },
);
router.post(
  "/:id/check-out",
  allowRoles("admin", "security", "frontdesk"),
  async (req, res, next) => {
    try {
      const visitor = await Visitor.findOne({
        _id: req.params.id,
        organizationId: req.admin.organizationId,
      });
      if (!visitor)
        return res.status(404).json({ message: "Visitor pass not found." });
      if (visitor.status !== "checked-in")
        return res.status(409).json({
          message: "Only checked-in visitors can check out.",
        });
      visitor.status = "checked-out";
      visitor.checkedOutAt = new Date();
      await visitor.save();
      await CheckLog.create({
        organizationId: req.admin.organizationId,
        visitorId: visitor._id,
        passId: visitor.passId,
        action: "check-out",
        actorId: req.admin._id,
      });
      res.json({
        visitor,
        message: "Visitor checked out successfully.",
      });
    } catch (e) {
      next(e);
    }
  },
);
router.post(
  "/:id/revoke",
  allowRoles("admin", "frontdesk"),
  async (req, res, next) => {
    try {
      const visitor = await Visitor.findOne({
        _id: req.params.id,
        organizationId: req.admin.organizationId,
      });
      if (!visitor)
        return res.status(404).json({ message: "Visitor not found." });
      if (visitor.status === "checked-in")
        return res
          .status(409)
          .json({ message: "Check out the visitor before revoking the pass." });
      visitor.status = "revoked";
      await visitor.save();
      await Pass.updateOne(
        { passId: visitor.passId, organizationId: req.admin.organizationId },
        { $set: { revokedAt: new Date() } },
      );
      res.json({ visitor, message: "Pass revoked." });
    } catch (e) {
      next(e);
    }
  },
);

router.delete(
  ["/:id", "/:id/pass"],
  allowRoles("admin"),
  async (req, res, next) => {
    try {
      const visitor = await Visitor.findOne({
        organizationId: req.admin.organizationId,
        $or: [
          { _id: /^[a-f\d]{24}$/i.test(req.params.id) ? req.params.id : null },
          { passId: req.params.id },
        ],
      });
      if (!visitor) {
        return res.status(404).json({ message: "Visitor pass not found." });
      }
      if (visitor.status !== "checked-out") {
        return res.status(409).json({
          message: "Pass can only be deleted after checkout.",
        });
      }

      await Pass.deleteMany({
        passId: visitor.passId,
        organizationId: req.admin.organizationId,
      });
      await CheckLog.deleteMany({
        passId: visitor.passId,
        organizationId: req.admin.organizationId,
      });
      await Appointment.updateMany(
        { visitorId: visitor._id, organizationId: req.admin.organizationId },
        { $set: { visitorId: null } },
      );
      await Visitor.deleteOne({
        _id: visitor._id,
        organizationId: req.admin.organizationId,
      });

      res.json({
        success: true,
        passId: visitor.passId,
        message: `Pass ${visitor.passId} deleted successfully.`,
      });
    } catch (e) {
      next(e);
    }
  },
);

router.get(
  "/:id/pdf",
  allowRoles("admin", "security", "frontdesk"),
  async (req, res, next) => {
    try {
      const visitor = await Visitor.findOne({
        organizationId: req.admin.organizationId,
        $or: [
          { _id: /^[a-f\d]{24}$/i.test(req.params.id) ? req.params.id : null },
          { passId: req.params.id },
        ],
      });
      if (!visitor)
        return res.status(404).json({ message: "Visitor pass not found." });
      const qr = await QRCode.toDataURL(
        JSON.stringify({
          passId: visitor.passId,
          organizationId: String(req.admin.organizationId),
        }),
      );
      const doc = new PDFDocument({ size: "A6", margin: 28 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; 
        filename=\"${visitor.passId}.pdf\"`,
      );
      doc.pipe(res);
      doc
        .fontSize(18)
        .fillColor("#123b35")
        .text("VISITPASS", { align: "center" });
      doc.moveDown(0.4);
      doc
        .fontSize(10)
        .fillColor("#555")
        .text("DIGITAL VISITOR PASS", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(16)
        .fillColor("#111")
        .text(visitor.fullName, { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Pass ID: ${visitor.passId}`);
      if (visitor.organization) doc.text(`Organization: ${visitor.organization}`);
      if (visitor.phone) doc.text(`Phone: ${visitor.phone}`);
      doc.text(`Host: ${visitor.hostName}`);
      doc.text(`Purpose: ${visitor.purpose}`);
      doc.text(
        `Visit date: ${new Date(visitor.visitDate).toLocaleDateString()}`,
      );
      doc.text(`Status: ${visitor.status}`);
      doc.moveDown();
      doc.image(qr, { fit: [120, 120], align: "center" });
      doc.moveDown(0.5);
      doc
        .fontSize(8)
        .fillColor("#666")
        .text("Present this QR code at the security desk.", {
          align: "center",
        });
      doc.end();
    } catch (e) {
      next(e);
    }
  },
);
function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export default router;
