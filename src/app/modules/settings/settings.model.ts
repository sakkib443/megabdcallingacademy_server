import { Schema, model } from 'mongoose';
import { ISiteSettings } from './settings.interface';

const settingsSchema = new Schema<ISiteSettings>(
    {
        // Hero Section - English
        heroBadge: { type: String, default: '🎓 A Leading Platform for Skills Development' },
        heroHeading1: { type: String, default: 'Transform Your' },
        heroHeading2: { type: String, default: 'Career Path' },
        heroHeadingWith: { type: String, default: 'with' },
        heroAcademyName: { type: String, default: 'Bdcalling Academy' },
        heroDescription: { type: String, default: 'Welcome to Bdcalling Academy — a leading IT training institute in Bangladesh.' },

        // Hero Section - Bengali
        heroBadgeBn: { type: String, default: '🎓 দক্ষতা উন্নয়নের একটি অগ্রণী প্ল্যাটফর্ম' },
        heroHeading1Bn: { type: String, default: 'আপনার ক্যারিয়ার' },
        heroHeading2Bn: { type: String, default: 'রূপান্তর করুন' },
        heroHeadingWithBn: { type: String, default: 'সাথে' },
        heroAcademyNameBn: { type: String, default: 'বিডিকলিং একাডেমি' },
        heroDescriptionBn: { type: String, default: 'বিডিকলিং একাডেমিতে স্বাগতম — বাংলাদেশের একটি শীর্ষস্থানীয় আইটি প্রশিক্ষণ প্রতিষ্ঠান।' },

        // Contact Information
        phoneNumber: { type: String, default: '+88 01335202802' },
        whatsappNumber: { type: String, default: '8801335202802' },
        email: { type: String, default: 'info@bdcallingacademy.com' },
        address: { type: String, default: 'Daisy Garden, House 14 (Level-5), Block A, Banasree, Dhaka' },
        addressBn: { type: String, default: 'ডেইজি গার্ডেন, বাড়ি ১৪ (লেভেল-৫), ব্লক এ, বনশ্রী, ঢাকা' },

        // Social Links
        facebookUrl: { type: String, default: 'https://www.facebook.com/bdcallingacademy.bd' },
        youtubeUrl: { type: String, default: 'https://www.youtube.com/@bdCalling' },
        linkedinUrl: { type: String, default: 'https://www.linkedin.com/company/bdcallingitltd' },
    },
    { timestamps: true }
);

export const Settings = model<ISiteSettings>('Settings', settingsSchema);
