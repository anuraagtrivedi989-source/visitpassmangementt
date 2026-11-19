import { Router } from 'express';
import Visitor from '../models/Visitor.js';
import Appointment from '../models/Appointment.js';
import CheckLog from '../models/CheckLog.js';
const router = Router();
router.get('/stats', async (req, res, next) => {
    try {
        const f = { organizationId: req.admin.organizationId };
        if (req.admin.role === 'employee') {
            const pendingAppointments = await Appointment.countDocuments({ ...f, requestedBy: req.admin._id, status: 'pending' });
            return res.json(
                { total: 0, scheduled: 0, checkedIn: 0, checkedOut: 0, pendingAppointments, todayLogs: 0 }
            );
        }
        const [total, scheduled, checkedIn, checkedOut, pendingAppointments, todayLogs] = await Promise.all([Visitor.countDocuments(f), Visitor.countDocuments({ ...f, status: 'scheduled' }), Visitor.countDocuments({ ...f, status: 'checked-in' }), Visitor.countDocuments({ ...f, status: 'checked-out' }), Appointment.countDocuments({ ...f, status: 'pending' }), CheckLog.countDocuments({
            ...f, occurredAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0
                ))
            }
        })]);
        res.json({ total, scheduled, checkedIn, checkedOut, pendingAppointments, todayLogs });
    } catch (e) { 
        next(e); 
    }
});
 export default router;
