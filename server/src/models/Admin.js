import mongoose from 'mongoose';
const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'security', 'frontdesk', 'employee'],
        default: 'admin',
        index: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
export default mongoose.model('Admin', adminSchema);
