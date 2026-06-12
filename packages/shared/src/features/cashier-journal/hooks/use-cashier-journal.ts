import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { cashierJournalKeys } from '../../../lib/query';
import { emailCashierDailyReport, fetchCashierDailyReport } from '../api/client';

export function useCashierDailyReport(date: string) {
  return useQuery({
    queryKey: cashierJournalKeys.daily(date),
    queryFn: () => fetchCashierDailyReport(date),
    staleTime: 30_000,
  });
}

export function useEmailCashierDailyReport() {
  return useMutation({
    mutationFn: ({ date, to }: { date: string; to?: string }) =>
      emailCashierDailyReport(date, to),
    onSuccess: (data) => {
      toast.success('Rapport envoyé par email', { description: `Envoyé à ${data.sentTo}` });
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Impossible d'envoyer le rapport";
      toast.error(message);
    },
  });
}
