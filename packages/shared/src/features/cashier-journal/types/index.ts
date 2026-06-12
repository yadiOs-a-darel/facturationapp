export type CashierActivityType =
  | 'INVOICE'
  | 'DELIVERY_NOTE'
  | 'QUOTE'
  | 'CREDIT_NOTE'
  | 'PAYMENT'
  | 'CANCELLATION'
  | 'EXPENSE'
  | 'DRAFT';

export interface CashierActivity {
  id: string;
  type: CashierActivityType;
  label: string;
  reference: string;
  amount: number | null;
  status: string | null;
  at: string;
  details: string | null;
}

export interface CashierDailyReport {
  userId: string;
  firstName: string;
  lastName: string;
  invoicesCount: number;
  paymentsTotal: number;
  paymentsCount: number;
  cancellationsCount: number;
  deliveryNotesCount: number;
  expensesTotal: number;
  expensesCount: number;
  draftsCount: number;
  activities: CashierActivity[];
}

export interface CashierDailyResponse {
  date: string;
  cashiers: CashierDailyReport[];
  totals: {
    invoicesCount: number;
    paymentsTotal: number;
    cancellationsCount: number;
    deliveryNotesCount: number;
    expensesTotal: number;
    activityCount: number;
  };
}
