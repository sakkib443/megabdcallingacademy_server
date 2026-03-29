import { Certificate } from './certificate.model';
import { ICertificate } from './certificate.interface';

/** Generate unique certificate ID: BAC-CERT-XXXX */
async function generateCertificateId(): Promise<string> {
    const prefix = 'BAC-CERT-';
    const lastCert = await Certificate.findOne({ id: { $regex: /^BAC-CERT-\d+$/ } }).sort({ id: -1 }).lean();
    let nextNum = 1;
    if (lastCert?.id) {
        const match = lastCert.id.match(/BAC-CERT-(\d+)/);
        if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    const totalCount = await Certificate.countDocuments({});
    if (totalCount >= nextNum) nextNum = totalCount + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
}

/** Generate QR code data (simple verification URL) */
function generateQRData(certId: string): { qrCode: string; verificationUrl: string } {
    const verificationUrl = `http://localhost:3000/verify-certificate?id=${certId}`;
    // Simple QR data — frontend will render using a QR library
    return { qrCode: verificationUrl, verificationUrl };
}

// ─── Create Certificate (manual or auto) ────────────────────
const createCertificate = async (payload: Partial<ICertificate>): Promise<ICertificate> => {
    const id = await generateCertificateId();
    const qr = generateQRData(id);
    const certificateData = {
        ...payload,
        id,
        issueDate: new Date(),
        status: 'pending' as const,
        qrCode: qr.qrCode,
        verificationUrl: qr.verificationUrl,
        isDeleted: false,
    };
    return Certificate.create(certificateData);
};

// ─── Auto-Generate (when course progress = 100%) ────────────
const autoGenerate = async (studentId: string, studentName: string, courseName: string, batchId: string, batchNumber: string, startDate: Date, endDate: Date) => {
    // Check if already exists
    const existing = await Certificate.findOne({ studentId, courseName, isDeleted: false });
    if (existing) return existing;

    return createCertificate({ studentId, studentName, courseName, batchId, batchNumber, startDate, endDate });
};

// ─── Get All (Admin) ────────────────────────────────────────
const getAllCertificates = async (statusFilter?: string) => {
    const filter: any = { isDeleted: false };
    if (statusFilter && statusFilter !== 'all') filter.status = statusFilter;
    return Certificate.find(filter).sort({ createdAt: -1 });
};

// ─── Get Pending (Admin workflow) ───────────────────────────
const getPending = async () => {
    return Certificate.find({ status: 'pending', isDeleted: false }).sort({ createdAt: -1 });
};

// ─── Activate Certificate (Admin) ───────────────────────────
const activate = async (certId: string, adminId: string) => {
    return Certificate.findOneAndUpdate(
        { id: certId, isDeleted: false },
        { status: 'active', activatedBy: adminId, activatedAt: new Date() },
        { new: true }
    );
};

// ─── Revoke Certificate ─────────────────────────────────────
const revoke = async (certId: string) => {
    return Certificate.findOneAndUpdate(
        { id: certId, isDeleted: false },
        { status: 'revoked' },
        { new: true }
    );
};

// ─── Search ─────────────────────────────────────────────────
const searchCertificates = async (query: { studentId?: string; studentName?: string; courseName?: string }) => {
    const conditions: any[] = [];
    if (query.studentId) conditions.push({ studentId: { $regex: query.studentId, $options: 'i' } });
    if (query.studentName) conditions.push({ studentName: { $regex: query.studentName, $options: 'i' } });
    if (query.courseName) conditions.push({ courseName: { $regex: query.courseName, $options: 'i' } });
    if (conditions.length === 0) return [];
    return Certificate.find({ $or: conditions, isDeleted: false, status: 'active' });
};

// ─── Get by ID (public verify) ──────────────────────────────
const getCertificateById = async (id: string) => {
    return Certificate.findOne({ id, isDeleted: false });
};

// ─── Verify (public) ────────────────────────────────────────
const verify = async (certId: string) => {
    const cert = await Certificate.findOne({ id: certId, isDeleted: false });
    if (!cert) return { valid: false, message: 'Certificate not found' };
    if (cert.status === 'revoked') return { valid: false, message: 'Certificate has been revoked', certificate: cert };
    if (cert.status === 'pending') return { valid: false, message: 'Certificate is pending activation', certificate: cert };
    return { valid: true, message: 'Certificate is valid', certificate: cert };
};

// ─── Student's Certificates ─────────────────────────────────
const getStudentCertificates = async (studentId: string) => {
    return Certificate.find({ studentId, isDeleted: false }).sort({ createdAt: -1 });
};

// ─── Stats ──────────────────────────────────────────────────
const getStats = async () => {
    const [total, pending, active, revoked] = await Promise.all([
        Certificate.countDocuments({ isDeleted: false }),
        Certificate.countDocuments({ status: 'pending', isDeleted: false }),
        Certificate.countDocuments({ status: 'active', isDeleted: false }),
        Certificate.countDocuments({ status: 'revoked', isDeleted: false }),
    ]);
    return { total, pending, active, revoked };
};

// ─── Delete / Update ────────────────────────────────────────
const deleteCertificate = async (id: string) => Certificate.findOneAndUpdate({ id, isDeleted: false }, { isDeleted: true }, { new: true });
const updateCertificate = async (id: string, payload: Partial<ICertificate>) => Certificate.findOneAndUpdate({ id, isDeleted: false }, payload, { new: true });

export const CertificateService = {
    createCertificate, autoGenerate,
    getAllCertificates, getPending,
    activate, revoke,
    searchCertificates, getCertificateById, verify,
    getStudentCertificates, getStats,
    deleteCertificate, updateCertificate,
};
