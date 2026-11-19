import { Router } from 'express';
import Appointment from '../models/Appointment.js';
import Visitor from '../models/Visitor.js';
import Pass from '../models/Pass.js';
import { createPassId } from '../utils/passId.js';
import { allowRoles } from '../middleware/auth.js';
const router = Router();
router.get('/', allowRoles('admin', 'frontdesk', 'employee'),
    async (req, res, next) => {
        try {
            const filter = { organizationId: req.admin.organizationId };
            if (req.admin.role === 'employee') filter.requestedBy = req.admin._id;
            if (req.query.status && ['pending', 'approved', 'rejected', 'completed'].includes(req.query.status))
                filter.status = req.query.status;
            const appointments = await Appointment.find(filter).sort({ scheduledAt: 1 }).limit(300).lean(); 
            res.json({ appointments });
        } catch (e) { next(e); }
    });
router.post('/', allowRoles('admin', 'frontdesk', 'employee'), async (req, res, next) => {
    try {
        const b = req.body;
        for (const f of ['visitorName', 'visitorPhone', 'hostName', 'purpose', 'scheduledAt'])
            if (!String(b[f] || '').trim()) return res.status(400).json({ message: `${f} is required.` });
        const scheduledAt = new Date(b.scheduledAt);
        if (Number.isNaN(scheduledAt.getTime())) return res.status(400).json({ message: 'Invalid scheduledAt.' });
        const appointment = await Appointment.create({ organizationId: req.admin.organizationId, visitorName: b.visitorName, visitorEmail: b.visitorEmail || '', visitorPhone: b.visitorPhone, hostName: b.hostName, purpose: b.purpose, scheduledAt, requestedBy: req.admin._id }); res.status(201).json({ appointment });
    } catch (e) { next(e); }
});
router.post('/:id/decision', allowRoles('admin', 'frontdesk'), async (req, res, next) => {
    try {
        const status = String(req.body.status || '');
        if (!['approved', 'rejected'].includes(status))
            return res.status(400).json({
                message: 'Decision must be approved or rejected.'
            });
        const appointment = await Appointment.findOne({ _id: req.params.id, organizationId: req.admin.organizationId });
        if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
        if (appointment.status !== 'pending') return res.status(409).json({ message: 'Appointment already processed.' });
        appointment.status = status;
        appointment.approvedBy = req.admin._id;
        if (status === 'approved') {
            const passId = createPassId();
            const visitor = await Visitor.create({ organizationId: req.admin.organizationId, passId, fullName: appointment.visitorName, phone: appointment.visitorPhone, email: appointment.visitorEmail, purpose: appointment.purpose, hostName: appointment.hostName, visitDate: appointment.scheduledAt, createdBy: req.admin._id, appointmentId: appointment._id });

            appointment.visitorId = visitor._id;
            await Pass.create({
                organizationId: req.admin.organizationId, visitorId: visitor._id, passId, qrPayload: JSON.stringify({ passId, organizationId: String(req.admin.organizationId) }), validFrom: new Date(appointment.scheduledAt.setHours(0, 0, 0, 0)), validUntil: new Date(appointment.scheduledAt.setHours(23, 59, 59, 999)), issuedBy: req.admin._id
            });
        } await appointment.save(); res.json({ appointment, message: `Appointment ${status}.` });
    } catch (e) { next(e); }
});
export default router;
