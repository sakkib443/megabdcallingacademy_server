import { Schema, model } from 'mongoose';
import { IPartner } from './partner.interface';

const partnerSchema = new Schema<IPartner>(
    {
        name: { type: String, required: true },
        category: {
            type: String,
            enum: ['Our Concern', 'Colaboration With', 'Member Of'],
            required: true,
        },
        image: { type: String, required: true },
        link: { type: String },
    },
    {
        timestamps: true,
    },
);

export const Partner = model<IPartner>('Partner', partnerSchema);
