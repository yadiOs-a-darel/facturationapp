export interface DashboardRecentInvoice {
  id: string;
  number: string;
  status: string;
  totalTTC: number;
  issueDate: string;
  customerName: string;
}

export interface DashboardStockAlert {
  productId: string;
  code: string;
  name: string;
  stockQuantity: number;
  stockMin: number;
}

export interface DashboardKpis {
  totalSales: number;
  totalInvoices: number;
  unpaidInvoices: number;
  stockValue: number;
  recentInvoices: DashboardRecentInvoice[];
  stockAlerts: DashboardStockAlert[];
}

export interface DashboardResponse {
  data: DashboardKpis;
}
