export interface IBatch {
    id: string;           // Batch ID like "WEB-01", "PYT-02"
    name?: string;        // Batch name (optional custom name)
    courseName: string;   // Course name
    courseId?: any;        // Reference to Course
    startDate: Date;
    endDate: Date;
    maxStudents?: number;
    status: 'active' | 'completed' | 'upcoming';
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
