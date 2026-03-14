import { IPartner } from './partner.interface';
import { Partner } from './partner.model';

const createPartnerIntoDB = async (payload: IPartner) => {
    const result = await Partner.create(payload);
    return result;
};

const getAllPartnersFromDB = async () => {
    const result = await Partner.find();
    return result;
};

const getSinglePartnerFromDB = async (id: string) => {
    const result = await Partner.findById(id);
    return result;
};

const updatePartnerIntoDB = async (id: string, payload: Partial<IPartner>) => {
    const result = await Partner.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
};

const deletePartnerFromDB = async (id: string) => {
    const result = await Partner.findByIdAndDelete(id);
    return result;
};

export const PartnerServices = {
    createPartnerIntoDB,
    getAllPartnersFromDB,
    getSinglePartnerFromDB,
    updatePartnerIntoDB,
    deletePartnerFromDB,
};
