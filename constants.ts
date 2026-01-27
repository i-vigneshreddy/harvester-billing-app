
import { AppSettings, VehicleType, PaymentType } from './types';

export const INITIAL_SETTINGS: AppSettings = {
  companyName: 'Vigneshwara Harvester',
  description: 'Enterprise Harvester Billing System',
  ownerName: 'Palwai Mahender Reddy',
  address: '',
  mobile: '',
  email: '',
  upiId: '',
  theme: 'light',
  googleClientId: '' // Placeholder for owner configuration
};

export const VEHICLE_TYPES = Object.values(VehicleType);
export const PAYMENT_TYPES = Object.values(PaymentType);
