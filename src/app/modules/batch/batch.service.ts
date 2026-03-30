import { Batch } from './batch.model';
import { IBatch } from './batch.interface';
import { Mentor } from '../mentor/mentor.model';

/**
 * Generate a batch ID based on course name
 * Format: COURSE-XX (e.g., WEB-01, PYT-02)
 */
async function generateBatchId(courseName: string): Promise<string> {
    const courseCode = courseName
        .split(' ')
        .map(word => word.substring(0, 3))
        .join('')
        .toUpperCase()
        .slice(0, 6);

    const existingBatches = await Batch.find({
        id: { $regex: new RegExp(`^${courseCode}-`, 'i') },
        isDeleted: false,
    }).lean();

    let maxNum = 0;
    for (const batch of existingBatches) {
        const match = batch.id.match(/-(\d+)$/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
        }
    }

    const nextNum = maxNum + 1;
    return `${courseCode}-${String(nextNum).padStart(2, '0')}`;
}

// Create a new batch
const createBatch = async (payload: Partial<IBatch>): Promise<IBatch> => {
    const id = await generateBatchId(payload.courseName || 'BATCH');

    const now = new Date();
    const startDate = new Date(payload.startDate || now);
    const endDate = new Date(payload.endDate || now);

    let status: 'active' | 'completed' | 'upcoming' = 'upcoming';
    if (now >= startDate && now <= endDate) {
        status = 'active';
    } else if (now > endDate) {
        status = 'completed';
    }

    const batchData = {
        ...payload,
        id,
        name: payload.name || `${payload.courseName} - Batch ${id.split('-').pop()}`,
        status,
        isDeleted: false,
    };

    const newBatch = await Batch.create(batchData);
    return newBatch;
};

// Get all batches (with courseId populated)
const getAllBatches = async (): Promise<IBatch[]> => {
    const batches = await Batch.find({ isDeleted: false })
        .populate('courseId', 'title image type')
        .populate('mentorId', 'name image designation')
        .sort({ createdAt: -1 });
    return batches;
};

// Get single batch by ID
const getBatchById = async (id: string): Promise<IBatch | null> => {
    const batch = await Batch.findOne({ id, isDeleted: false })
        .populate('courseId', 'title image type')
        .populate('mentorId', 'name image designation');
    return batch;
};

// Get batches by course
const getBatchesByCourse = async (courseId: string): Promise<IBatch[]> => {
    const batches = await Batch.find({ courseId, isDeleted: false })
        .populate('courseId', 'title image type')
        .sort({ createdAt: -1 });
    return batches;
};

// Update batch
const updateBatch = async (id: string, payload: Partial<IBatch>): Promise<IBatch | null> => {
    const batch = await Batch.findOneAndUpdate(
        { id, isDeleted: false },
        payload,
        { new: true }
    ).populate('courseId', 'title image type');
    return batch;
};

// Delete batch (soft delete)
const deleteBatch = async (id: string): Promise<IBatch | null> => {
    const batch = await Batch.findOneAndUpdate(
        { id, isDeleted: false },
        { isDeleted: true },
        { new: true }
    );
    return batch;
};

// Get batches by mentor (via userId)
const getBatchesByMentor = async (userId: string): Promise<IBatch[]> => {
    // Find mentor by userId
    const mentor = await Mentor.findOne({ userId });
    if (!mentor) return [];
    const batches = await Batch.find({ mentorId: mentor._id, isDeleted: false })
        .populate('courseId', 'title image type fee')
        .populate('mentorId', 'name image designation')
        .sort({ startDate: -1 });
    return batches;
};

export const BatchService = {
    createBatch,
    getAllBatches,
    getBatchById,
    getBatchesByCourse,
    getBatchesByMentor,
    updateBatch,
    deleteBatch,
};
