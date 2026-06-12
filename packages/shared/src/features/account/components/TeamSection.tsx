import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, CheckCircle, Pencil, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { teamKeys } from '../../../lib/query';
import { useAuth } from '../../auth/hooks/use-auth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  createTeamUser,
  deleteTeamUser,
  fetchTeamUsers,
  updateTeamUser,
  type TeamUser,
} from '../api/team-client';

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: 'Super administrateur',
  ADMIN: 'Administrateur',
  CASHIER: 'Caissier',
};

export function TeamSection() {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: teamKeys.all,
    queryFn: fetchTeamUsers,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<TeamUser | null>(null);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'CASHIER' as 'ADMIN' | 'CASHIER',
  });
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CASHIER' as 'ADMIN' | 'CASHIER',
    password: '',
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: teamKeys.all });

  const createMutation = useMutation({
    mutationFn: () => createTeamUser(createForm),
    onSuccess: () => {
      invalidate();
      toast.success('Utilisateur ajouté');
      setCreateOpen(false);
      setCreateForm({ email: '', password: '', firstName: '', lastName: '', role: 'CASHIER' });
    },
    onError: (e: Error) => toast.error(e.message || 'Erreur lors de la création'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateTeamUser>[1] }) =>
      updateTeamUser(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success('Utilisateur mis à jour');
      setEditUser(null);
    },
    onError: (e: Error) => toast.error(e.message || 'Erreur lors de la mise à jour'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTeamUser,
    onSuccess: () => {
      invalidate();
      toast.success('Utilisateur supprimé');
    },
    onError: (e: Error) => toast.error(e.message || 'Suppression impossible'),
  });

  const toggleBlock = (member: TeamUser) => {
    updateMutation.mutate({
      id: member.id,
      payload: { isActive: !member.isActive },
    });
  };

  const openEdit = (member: TeamUser) => {
    setEditUser(member);
    setEditForm({
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone ?? '',
      role: member.role === 'ADMIN' ? 'ADMIN' : 'CASHIER',
      password: '',
    });
  };

  const canManage = (member: TeamUser) => {
    if (member.id === currentUser?.id) return false;
    if (member.role === 'SUPER_ADMIN') return false;
    return true;
  };

  const members = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membres de l&apos;équipe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}
          {!isLoading && members.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun utilisateur.</p>
          )}
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-3 border-b border-border/60 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {member.firstName} {member.lastName}
                  </span>
                  <Badge variant="outline">{roleLabel[member.role] ?? member.role}</Badge>
                  {!member.isActive && (
                    <Badge variant="destructive">Bloqué</Badge>
                  )}
                  {member.id === currentUser?.id && (
                    <Badge variant="secondary">Vous</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>

              {canManage(member) && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(member)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleBlock(member)}
                    disabled={updateMutation.isPending}
                  >
                    {member.isActive ? (
                      <>
                        <Ban className="h-4 w-4 mr-1" />
                        Bloquer
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Débloquer
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm(`Supprimer ${member.firstName} ${member.lastName} ?`)) {
                        deleteMutation.mutate(member.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Création */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel utilisateur</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Prénom"
              value={createForm.firstName}
              onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
            />
            <Input
              placeholder="Nom"
              value={createForm.lastName}
              onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
            />
            <Input
              className="md:col-span-2"
              placeholder="Email"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            />
            <Input
              className="md:col-span-2"
              type="password"
              placeholder="Mot de passe (min. 6 caractères)"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            />
            <select
              className="md:col-span-2 border rounded-md px-3 py-2 bg-background"
              value={createForm.role}
              onChange={(e) =>
                setCreateForm({ ...createForm, role: e.target.value as 'ADMIN' | 'CASHIER' })
              }
            >
              <option value="CASHIER">Caissier</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modification */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier {editUser?.firstName} {editUser?.lastName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Prénom"
              value={editForm.firstName}
              onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
            />
            <Input
              placeholder="Nom"
              value={editForm.lastName}
              onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
            />
            <Input
              className="md:col-span-2"
              placeholder="Téléphone"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
            <select
              className="md:col-span-2 border rounded-md px-3 py-2 bg-background"
              value={editForm.role}
              onChange={(e) =>
                setEditForm({ ...editForm, role: e.target.value as 'ADMIN' | 'CASHIER' })
              }
            >
              <option value="CASHIER">Caissier</option>
              <option value="ADMIN">Administrateur</option>
            </select>
            <Input
              className="md:col-span-2"
              type="password"
              placeholder="Nouveau mot de passe (laisser vide pour ne pas changer)"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (!editUser) return;
                const payload: Parameters<typeof updateTeamUser>[1] = {
                  firstName: editForm.firstName,
                  lastName: editForm.lastName,
                  phone: editForm.phone || null,
                  role: editForm.role,
                };
                if (editForm.password.trim()) {
                  payload.password = editForm.password;
                }
                updateMutation.mutate({ id: editUser.id, payload });
              }}
              disabled={updateMutation.isPending}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
