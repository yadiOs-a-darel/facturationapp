export interface DashboardKpis {
  totalSales: number;
  totalInvoices: number;
  unpaidInvoices: number;
  stockValue: number;
}

export interface DashboardResponse {
  data: DashboardKpis;
}