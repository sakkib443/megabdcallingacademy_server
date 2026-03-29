import express from 'express';
import { CertificateController } from './certificate.controller';
import { authMiddleware, authorize } from '../../middlewares/auth';

const router = express.Router();

// Public: Verify certificate (NO auth needed)
router.get('/verify/:certId', CertificateController.verify);
router.get('/search', CertificateController.search);

// Student: My certificates
router.get('/my', authMiddleware, CertificateController.myCertificates);

// Admin
router.post('/', authMiddleware, authorize('admin', 'trainingManager'), CertificateController.create);
router.get('/', authMiddleware, authorize('admin', 'trainingManager'), CertificateController.getAll);
router.get('/pending', authMiddleware, authorize('admin'), CertificateController.getPending);
router.get('/stats', authMiddleware, authorize('admin'), CertificateController.stats);
router.get('/:certId', authMiddleware, CertificateController.getById);
router.patch('/:certId', authMiddleware, authorize('admin'), CertificateController.update);
router.patch('/:certId/activate', authMiddleware, authorize('admin'), CertificateController.activate);
router.patch('/:certId/revoke', authMiddleware, authorize('admin'), CertificateController.revoke);
router.delete('/:certId', authMiddleware, authorize('admin'), CertificateController.remove);

export const CertificateRoutes = router;
