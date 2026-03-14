import { Schema, model } from 'mongoose';
import { IBatch } from './batch.interface';

const batchSchema = new Schema<IBatch>(
    {
        id: {
            type: String,
            required: true,
            unique: true,
        },
        courseName: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'upcoming'],
            default: 'upcoming',
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Batch = model<IBatch>('Batch', batchSchema);
