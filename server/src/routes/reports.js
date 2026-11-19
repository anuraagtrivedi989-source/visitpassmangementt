import { Router } from 'express';
import Visitor from '../models/Visitor.js';
import CheckLog from '../models/CheckLog.js';
import { allowRoles } from '../middleware/auth.js';
const router = Router();
router.get('/logs', allowRoles('admin', 'security', 'frontdesk'), async (req, res, next) => {
    try {
        const logs = await CheckLog.find({ organizationId: req.admin.organizationId }).populate('visitorId', 'fullName phone hostName').populate('actorId', 'name role').sort({ occurredAt: -1 }).limit(500).lean();
        res.json({ logs });
    } catch (e) {
        next(e);
    }
});
router.get('/export.csv', allowRoles('admin'), async (req, res, next) => {
    try {
        const rows = await Visitor.find({ organizationId: req.admin.organizationId }).sort({ createdAt: -1 }).limit(5000).lean();
        const cell = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
        const headers = ['Pass ID', 'Visitor', 'Phone', 'Email', 'Host', 'Purpose', 'Visit Date', 'Status', 'Check In', 'Check Out'];
        const csv = [headers, ...rows.map(v => [v.passId, v.fullName, v.phone, v.email, v.hostName, v.purpose, v.visitDate?.toISOString(), v.status, v.checkedInAt?.toISOString(), v.checkedOutAt?.toISOString()])].map(r => r.map(cell).join(',')).join('\r\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="visitpass-report.csv"');
        res.send(csv);
    } catch (e) {
        next(e);
    }
});
export default router;
