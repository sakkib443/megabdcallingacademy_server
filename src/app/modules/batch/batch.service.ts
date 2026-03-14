import { Batch } from './batch.model';
import { IBatch } from './batch.interface';

/**
 * Generate a batch ID based on course name
 * Format: COURSE-XX (e.g., WEB-01, PYT-02)
 */
async function generateBatchId(courseName: string): Promise<string> {
    // Get short code from course name (first 3 letters of each word)
    const courseCode = courseName
        .split(' ')
        .map(word => word.substring(0, 3))
        .join('')
        .toUpperCase()
        .slice(0, 6);

    // Find highest existing batch number for this course
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

    // Determine status based on dates
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
        status,
        isDeleted: false,
    };

    const newBatch = await Batch.create(batchData);
    return newBatch;
};

// Get all batches
const getAllBatches = async (): Promise<IBatch[]> => {
    const batches = await Batch.find({ isDeleted: false }).sort({ createdAt: -1 });
    return batches;
};

// Get single batch by ID
const getBatchById = async (id: string): Promise<IBatch | null> => {
    const batch = await Batch.findOne({ id, isDeleted: false });
    return batch;
};

// Update batch
const updateBatch = async (id: string, payload: Partial<IBatch>): Promise<IBatch | null> => {
    const batch = await Batch.findOneAndUpdate(
        { id, isDeleted: false },
        payload,
        { new: true }
    );
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

export const BatchService = {
    createBatch,
    getAllBatches,
    getBatchById,
    updateBatch,
    deleteBatch,
};
