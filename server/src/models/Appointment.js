import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    visitorName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    visitorEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
    },
    visitorPhone: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
    },
    hostName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    purpose: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
    },
    scheduledAt: {
        type: Date,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending', index: true
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', default: null
    },
    visitorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visitor',
        default: null
    }
}, { timestamps: true });
schema.index({ organizationId: 1, scheduledAt: -1 });
export default mongoose.model('Appointment', schema);
