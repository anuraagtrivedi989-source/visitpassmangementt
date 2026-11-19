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
        unique: true,
        index: true
    }, qrPayload: {
        type: String,
        required: true
    }, validFrom: {
        type: Date,
        required: true
    }, validUntil: {
        type: Date,
        required: true
    }, revokedAt: {
        type: Date,
        default: null
    }, issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, { timestamps: true });
export default mongoose.model('Pass', schema);
