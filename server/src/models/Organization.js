import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
export default mongoose.model('Organization', schema);
