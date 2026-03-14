import { Router } from 'express';
import { CertificateController } from './certificate.controller';

const router = Router();

// Create new certificate (admin)
router.post('/', CertificateController.createCertificateController);

// Get all certificates (admin)
router.get('/', CertificateController.getAllCertificatesController);

// Search certificates (public)
router.get('/search', CertificateController.searchCertificatesController);

// Get single certificate by ID
router.get('/:id', CertificateController.getCertificateByIdController);

// Update certificate
router.patch('/:id', CertificateController.updateCertificateController);

// Delete certificate
router.delete('/:id', CertificateController.deleteCertificateController);

export const CertificateRoutes = router;
