export interface ICertificate {
    id: string;           // Certificate ID like "BAC-CERT-001"
    studentId: string;    // Manually entered student ID
    studentName: string;  // Full name of student
    batchId: string;      // Reference to batch ID
    courseName: string;   // Course name (from batch)
    batchNumber: string;  // Batch number (from batch)
    startDate: Date;      // Course start date (from batch)
    endDate: Date;        // Course end date (from batch)
    issueDate: Date;
    status: 'active' | 'revoked';
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
