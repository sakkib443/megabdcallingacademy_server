import { Schema, model } from 'mongoose';
import { IBatch } from './batch.interface';

const batchSchema = new Schema<IBatch>(
    {
        id: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
        },
        courseName: {
            type: String,
            required: true,
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        maxStudents: {
            type: Number,
            default: 50,
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
