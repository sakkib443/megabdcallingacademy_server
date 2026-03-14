import express from 'express';
import { PartnerController } from './partner.controller';

const router = express.Router();

router.post('/', PartnerController.createPartner);
router.get('/', PartnerController.getAllPartners);
router.get('/:id', PartnerController.getSinglePartner);
router.patch('/:id', PartnerController.updatePartner);
router.delete('/:id', PartnerController.deletePartner);

export const PartnerRoutes = router;
