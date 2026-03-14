import { Certificate } from './certificate.model';
import { ICertificate } from './certificate.interface';

/**
 * Generate a unique certificate ID in format: BAC-CERT-XXXX
 */
async function generateCertificateId(): Promise<string> {
    const prefix = 'BAC-CERT-';

    // Find the highest existing certificate number
    const lastCertificate = await Certificate.findOne({
        id: { $regex: /^BAC-CERT-\d+$/ }
    }).sort({ id: -1 }).lean();

    let nextNumber = 1;

    if (lastCertificate && lastCertificate.id) {
        const match = lastCertificate.id.match(/BAC-CERT-(\d+)/);
        if (match) {
            nextNumber = parseInt(match[1], 10) + 1;
        }
    }

    // Also check total count to ensure uniqueness
    const totalCount = await Certificate.countDocuments({});
    if (totalCount >= nextNumber) {
        nextNumber = totalCount + 1;
    }

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}

// Create a new certificate
const createCertificate = async (payload: Partial<ICertificate>): Promise<ICertificate> => {
    const id = await generateCertificateId();
    const certificateData = {
        ...payload,
        id,
        issueDate: new Date(),
        status: 'active' as const,
        isDeleted: false,
    };

    const newCertificate = await Certificate.create(certificateData);
    return newCertificate;
};

// Get all certificates (for admin)
const getAllCertificates = async (): Promise<ICertificate[]> => {
    const certificates = await Certificate.find({ isDeleted: false }).sort({ createdAt: -1 });
    return certificates;
};

// Search certificates by studentId, studentName, or courseName
const searchCertificates = async (query: {
    studentId?: string;
    studentName?: string;
    courseName?: string;
    phoneNumber?: string;
    email?: string;
}): Promise<ICertificate[]> => {
    const { studentId, studentName, courseName } = query;

    const searchConditions: any[] = [];

    if (studentId) {
        searchConditions.push({ studentId: { $regex: studentId, $options: 'i' } });
    }
    if (studentName) {
        searchConditions.push({ studentName: { $regex: studentName, $options: 'i' } });
    }
    if (courseName) {
        searchConditions.push({ courseName: { $regex: courseName, $options: 'i' } });
    }

    if (searchConditions.length === 0) {
        return [];
    }

    const certificates = await Certificate.find({
        $or: searchConditions,
        isDeleted: false,
        status: 'active',
    });

    return certificates;
};

// Get single certificate by ID
const getCertificateById = async (id: string): Promise<ICertificate | null> => {
    const certificate = await Certificate.findOne({ id, isDeleted: false });
    return certificate;
};

// Delete certificate (soft delete)
const deleteCertificate = async (id: string): Promise<ICertificate | null> => {
    const certificate = await Certificate.findOneAndUpdate(
        { id, isDeleted: false },
        { isDeleted: true },
        { new: true }
    );
    return certificate;
};

// Update certificate
const updateCertificate = async (id: string, payload: Partial<ICertificate>): Promise<ICertificate | null> => {
    const certificate = await Certificate.findOneAndUpdate(
        { id, isDeleted: false },
        payload,
        { new: true }
    );
    return certificate;
};

export const CertificateService = {
    createCertificate,
    getAllCertificates,
    searchCertificates,
    getCertificateById,
    deleteCertificate,
    updateCertificate,
};
