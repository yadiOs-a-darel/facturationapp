import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { expensesKeys } from '../../../lib/query';
import { createExpense, deleteExpense, fetchExpenses } from '../api/client';
import type { ExpensePayload, ExpensesListParams } from '../types';

export function useExpenses(params?: ExpensesListParams) {
  return useQuery({
    queryKey: expensesKeys.list(params),
    queryFn: () => fetchExpenses(params),
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ExpensePayload) => createExpense(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: expensesKeys.all }); toast.success('Dépense enregistrée'); },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => { qc.invalidateQueries({ queryKey: expensesKeys.all }); toast.success('Dépense supprimée'); },
  });
}
