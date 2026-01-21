
import { AppSettings, VehicleType, PaymentType } from './types';

export const INITIAL_SETTINGS: AppSettings = {
  companyName: '',
  description: '',
  ownerName: '',
  address: '',
  mobile: '',
  email: '',
  upiId: '',
  theme: 'light'
};

export const VEHICLE_TYPES = Object.values(VehicleType);
export const PAYMENT_TYPES = Object.values(PaymentType);
