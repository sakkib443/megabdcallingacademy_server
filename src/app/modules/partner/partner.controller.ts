/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { PartnerServices } from './partner.services';

// CREATE Partner
const createPartner = async (req: Request, res: Response) => {
    try {
        const partner = await PartnerServices.createPartnerIntoDB(req.body);
        res.status(201).json({
            success: true,
            message: 'Partner created successfully',
            data: partner,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET All Partners
const getAllPartners = async (req: Request, res: Response) => {
    try {
        const partners = await PartnerServices.getAllPartnersFromDB();
        res.status(200).json({ success: true, data: partners });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET Single Partner
const getSinglePartner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const partner = await PartnerServices.getSinglePartnerFromDB(id);
        if (!partner) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }
        res.status(200).json({ success: true, data: partner });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE Partner
const updatePartner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedPartner = await PartnerServices.updatePartnerIntoDB(id, req.body);
        if (!updatedPartner) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Partner updated successfully',
            data: updatedPartner,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE Partner
const deletePartner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedPartner = await PartnerServices.deletePartnerFromDB(id);
        if (!deletedPartner) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Partner deleted successfully',
            data: deletedPartner,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const PartnerController = {
    createPartner,
    getAllPartners,
    getSinglePartner,
    updatePartner,
    deletePartner,
};
