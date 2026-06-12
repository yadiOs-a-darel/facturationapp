import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { numberingKeys } from '../../../lib/query';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { toast } from 'sonner';

export function NumberingSection() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: numberingKeys.all,
    queryFn: async () => (await apiClient.get('/numbering')).data,
  });

  const update = useMutation({
    mutationFn: ({ id, prefix, padding }: { id: string; prefix: string; padding: number }) =>
      apiClient.put(`/numbering/${id}`, { prefix, padding }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: numberingKeys.all });
      toast.success('Numérotation mise à jour');
    },
  });

  return (
    <Card>
      <CardHeader><CardTitle>Numérotation des documents</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {(data?.data ?? []).map((cfg: { id: string; documentType: string; prefix: string; padding: number; currentNumber: number }) => (
          <div key={cfg.id} className="grid gap-2 md:grid-cols-4 items-end border-b pb-3">
            <span className="font-medium text-sm">{cfg.documentType}</span>
            <Input defaultValue={cfg.prefix} id={`prefix-${cfg.id}`} />
            <Input type="number" defaultValue={cfg.padding} id={`pad-${cfg.id}`} />
            <Button
              size="sm"
              onClick={() => {
                const prefix = (document.getElementById(`prefix-${cfg.id}`) as HTMLInputElement).value;
                const padding = Number((document.getElementById(`pad-${cfg.id}`) as HTMLInputElement).value);
                update.mutate({ id: cfg.id, prefix, padding });
              }}
            >
              Enregistrer (n° {cfg.currentNumber})
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
