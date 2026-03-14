export interface IBatch {
    id: string;           // Batch ID like "WEB-01", "PYT-02"
    courseName: string;   // Course name
    startDate: Date;
    endDate: Date;
    status: 'active' | 'completed' | 'upcoming';
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
