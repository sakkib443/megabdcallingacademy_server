/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { CertificateService } from './certificate.service';

// Create new certificate
export const createCertificateController = async (req: Request, res: Response) => {
    try {
        const result = await CertificateService.createCertificate(req.body);
        res.status(201).json({
            success: true,
            message: 'Certificate created successfully',
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all certificates
export const getAllCertificatesController = async (req: Request, res: Response) => {
    try {
        const certificates = await CertificateService.getAllCertificates();
        res.status(200).json({
            success: true,
            message: 'Certificates retrieved successfully',
            data: certificates,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Search certificates
export const searchCertificatesController = async (req: Request, res: Response) => {
    try {
        const { studentId, studentName, courseName, phoneNumber, email } = req.query;
        const certificates = await CertificateService.searchCertificates({
            studentId: studentId as string,
            studentName: studentName as string,
            courseName: courseName as string,
            phoneNumber: phoneNumber as string,
            email: email as string,
        });
        res.status(200).json({
            success: true,
            message: 'Search completed',
            data: certificates,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single certificate
export const getCertificateByIdController = async (req: Request, res: Response) => {
    try {
        const certificate = await CertificateService.getCertificateById(req.params.id);
        if (!certificate) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Certificate retrieved successfully',
            data: certificate,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete certificate
export const deleteCertificateController = async (req: Request, res: Response) => {
    try {
        const certificate = await CertificateService.deleteCertificate(req.params.id);
        if (!certificate) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Certificate deleted successfully',
            data: certificate,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update certificate
export const updateCertificateController = async (req: Request, res: Response) => {
    try {
        const certificate = await CertificateService.updateCertificate(req.params.id, req.body);
        if (!certificate) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Certificate updated successfully',
            data: certificate,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const CertificateController = {
    createCertificateController,
    getAllCertificatesController,
    searchCertificatesController,
    getCertificateByIdController,
    deleteCertificateController,
    updateCertificateController,
};
