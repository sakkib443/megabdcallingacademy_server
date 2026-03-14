/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { BatchService } from './batch.service';

// Create new batch
export const createBatchController = async (req: Request, res: Response) => {
    try {
        const result = await BatchService.createBatch(req.body);
        res.status(201).json({
            success: true,
            message: 'Batch created successfully',
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all batches
export const getAllBatchesController = async (req: Request, res: Response) => {
    try {
        const batches = await BatchService.getAllBatches();
        res.status(200).json({
            success: true,
            message: 'Batches retrieved successfully',
            data: batches,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single batch
export const getBatchByIdController = async (req: Request, res: Response) => {
    try {
        const batch = await BatchService.getBatchById(req.params.id);
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Batch retrieved successfully',
            data: batch,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update batch
export const updateBatchController = async (req: Request, res: Response) => {
    try {
        const batch = await BatchService.updateBatch(req.params.id, req.body);
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Batch updated successfully',
            data: batch,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete batch
export const deleteBatchController = async (req: Request, res: Response) => {
    try {
        const batch = await BatchService.deleteBatch(req.params.id);
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Batch deleted successfully',
            data: batch,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const BatchController = {
    createBatchController,
    getAllBatchesController,
    getBatchByIdController,
    updateBatchController,
    deleteBatchController,
};
