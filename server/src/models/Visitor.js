import mongoose from 'mongoose';
const visitorSchema = new mongoose.Schema({

    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    }, passId: {
        type: String,
        required: true,
        unique: true,
        index: true
    }, fullName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
    },
    photoUrl: {
        type: String,
        default: ''
    },
    organization: {
        type: String,
        trim: true,
        maxlength: 120,
        default: ''
    },
    purpose: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
    },
    hostName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    visitDate: {
        type: Date,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'checked-in', 'checked-out', 'expired', 'revoked'],
        default: 'scheduled', index: true
    },
    checkedInAt: {
        type: Date, default: null
    },
    checkedOutAt: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        default: null
    }
},
    { timestamps: true }
);
visitorSchema.index(
    {
        organizationId: 1,
        createdAt: -1
    }
);
export default mongoose.model('Visitor', visitorSchema);
