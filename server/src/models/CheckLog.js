import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    visitorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visitor',
        required: true,
        index: true
    }, 
    passId: {
        type: String,
        required: true,
        index: true
    },
    action: {
        type: String,
        enum: ['check-in', 'check-out', 'verify', 'rejected'],
        required: true
    },
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    note: { type: String,
         default: '' },
    occurredAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });
export default mongoose.model('CheckLog', schema);
