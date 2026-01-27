
export enum PaymentType {
  CASH = 'Cash',
  PHONEPE = 'PhonePe',
  GOOGLE_PAY = 'Google Pay',
  ONLINE = 'Online'
}

export enum VehicleType {
  TWO_WHEEL = '2-wheel',
  FOUR_WHEEL = '4-wheel',
  TRACK = 'Track',
  HARVESTER = 'Harvester'
}

export enum ExpenseCategory {
  FOOD = 'Food',
  DIESEL = 'Diesel',
  PETROL = 'Petrol',
  TAX_TOLL = 'Tax & Tollgate',
  RTO = 'RTO',
  OTHERS = 'Others'
}

export enum NotificationType {
  OVERDUE = 'overdue',
  EXPENSE = 'expense',
  SYSTEM = 'system',
  SUCCESS = 'success'
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface WorkingSession {
  id: string;
  date: string;
  workTime: string; // HH:MM
  standardRate: number;
  totalAmount: number;
  machineId: string;
  billCopyUrl?: string;
  agentName?: string;
  agentId?: string;
  agentCommission?: number;
  commissionPaid?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  village: string;
}

export interface Bill {
  id: string;
  customer: Customer;
  sessions: WorkingSession[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentType: PaymentType;
  createdAt: string;
}

export interface Expense {
  id: string;
  vehicleId: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  billCopyUrl?: string;
}

export interface Driver {
  id: string;
  name: string;
  mobile: string;
  workStartDate: string;
  workEndDate?: string;
  salaryPerMonth: number;
  advanceAmount: number;
  pendingAmount: number;
  paymentHistory: {
    date: string;
    amount: number;
    type: PaymentType;
  }[];
}

export interface Agent {
  id: string;
  name: string;
  mobile: string;
  // Commission amounts for each vehicle type
  vehicleCommissions: Record<VehicleType, number>;
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  number: string;
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  userId: string;
  email: string;
  password?: string;
}

export interface AppSettings {
  companyName: string;
  description: string;
  ownerName: string;
  address: string;
  mobile: string;
  email: string;
  upiId: string;
  logo?: string;
  theme: 'light' | 'dark';
  googleDriveEnabled?: boolean;
  googleDriveLastSync?: string;
  googleClientId: string; // Added for cloud setup
}
