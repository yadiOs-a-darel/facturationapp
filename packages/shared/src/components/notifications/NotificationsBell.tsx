import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Bell, MessageSquarePlus, Package, Reply, Send } from 'lucide-react';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { SidebarMenuButton } from '../ui/sidebar';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMessageRecipients,
  useNotifications,
  useSendNotificationMessage,
} from '../../features/notifications/hooks/use-notifications';
import type { NotificationItem } from '../../features/notifications/types';

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function roleLabel(role: string): string {
  const r = role.toUpperCase();
  if (r === 'ADMIN' || r === 'SUPER_ADMIN') return 'Admin';
  if (r === 'CASHIER') return 'Caissier';
  return role;
}

function replyTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed.toLowerCase().startsWith('re:')) return trimmed;
  return `Re: ${trimmed}`;
}

function NotificationRow({
  item,
  onOpen,
}: {
  item: NotificationItem;
  onOpen: (item: NotificationItem) => void;
}) {
  const isStock = item.type === 'STOCK_ALERT';

  return (
    <button
      type="button"
      className={cn(
        'w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent/50',
        !item.isRead && 'border-primary/30 bg-primary/5',
      )}
      onClick={() => onOpen(item)}
    >
      <div className="flex items-start gap-2">
        <div
          className={cn(
            'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full',
            isStock
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
          )}
        >
          {isStock ? <Package className="size-3.5" /> : <Send className="size-3.5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium">{item.title}</p>
            {!item.isRead && (
              <span className="size-2 shrink-0 rounded-full bg-primary" />
            )}
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.body}</p>
          {item.sender && (
            <p className="mt-1 text-xs text-muted-foreground">
              De {item.sender.firstName} {item.sender.lastName} ({roleLabel(item.sender.role)})
            </p>
          )}
          <p className="mt-1 text-[10px] text-muted-foreground">
            {formatRelativeTime(item.createdAt)}
          </p>
        </div>
      </div>
    </button>
  );
}

export function NotificationsBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<NotificationItem | null>(null);
  const [recipientId, setRecipientId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const { data, isLoading } = useNotifications();
  const { data: recipientsData } = useMessageRecipients();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const sendMessage = useSendNotificationMessage();

  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const recipients = recipientsData?.data ?? [];
  const hasRecipients = recipients.length > 0;

  const resetCompose = () => {
    setRecipientId('');
    setTitle('');
    setBody('');
  };

  const openCompose = (options?: { recipientId?: string; title?: string }) => {
    resetCompose();
    if (options?.recipientId) setRecipientId(options.recipientId);
    if (options?.title) setTitle(options.title);
    setComposeOpen(true);
  };

  const handleOpenNotification = (item: NotificationItem) => {
    if (item.type === 'STOCK_ALERT') {
      setOpen(false);
      void navigate({ to: '/stock' });
      return;
    }

    if (!item.isRead) {
      markRead.mutate(item.id);
    }

    setSelectedMessage(item);
    setOpen(false);
    setDetailOpen(true);
  };

  const handleReply = () => {
    if (!selectedMessage?.sender) return;

    const canReply = recipients.some((r) => r.id === selectedMessage.sender?.id);
    if (!canReply) {
      openCompose();
      setDetailOpen(false);
      return;
    }

    setDetailOpen(false);
    openCompose({
      recipientId: selectedMessage.sender.id,
      title: replyTitle(selectedMessage.title),
    });
  };

  const handleSend = () => {
    if (!recipientId || !body.trim()) return;
    sendMessage.mutate(
      {
        recipientId,
        title: title.trim() || undefined,
        body: body.trim(),
      },
      {
        onSuccess: () => {
          setComposeOpen(false);
          resetCompose();
          setSelectedMessage(null);
        },
      },
    );
  };

  const canReplyToSelected =
    selectedMessage?.sender &&
    recipients.some((r) => r.id === selectedMessage.sender?.id);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <SidebarMenuButton
            className="relative !size-8 !p-0 justify-center text-muted-foreground hover:text-foreground transition-colors"
            tooltip="Notifications"
          >
            <Bell className="!size-4" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px]"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </SidebarMenuButton>
        </PopoverTrigger>
        <PopoverContent side="right" align="end" className="w-96 p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="font-semibold">Notifications</p>
              <p className="text-xs text-muted-foreground">
                Stock bas et messages équipe
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Envoyer un message"
                onClick={() => {
                  setOpen(false);
                  openCompose();
                }}
              >
                <MessageSquarePlus className="h-4 w-4" />
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                >
                  Tout lire
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="h-[min(420px,60vh)]">
            <div className="space-y-2 p-3">
              {isLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Chargement...</p>
              ) : notifications.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Aucune notification
                </p>
              ) : (
                notifications.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onOpen={handleOpenNotification}
                  />
                ))
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setOpen(false);
                openCompose();
              }}
            >
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Envoyer un message
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Détail du message */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.title ?? 'Message'}</DialogTitle>
            {selectedMessage?.sender && (
              <DialogDescription>
                De {selectedMessage.sender.firstName} {selectedMessage.sender.lastName} (
                {roleLabel(selectedMessage.sender.role)}) —{' '}
                {selectedMessage.createdAt
                  ? formatFullDate(selectedMessage.createdAt)
                  : ''}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {selectedMessage?.body}
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Fermer
            </Button>
            {canReplyToSelected ? (
              <Button onClick={handleReply}>
                <Reply className="mr-2 h-4 w-4" />
                Répondre
              </Button>
            ) : selectedMessage?.sender ? (
              <Button variant="secondary" disabled>
                Réponse non disponible
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Composer / réponse */}
      <Dialog
        open={composeOpen}
        onOpenChange={(isOpen) => {
          setComposeOpen(isOpen);
          if (!isOpen) resetCompose();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {title.toLowerCase().startsWith('re:') ? 'Répondre' : 'Nouveau message'}
            </DialogTitle>
            <DialogDescription>
              Envoyez un message à un administrateur ou un caissier de votre équipe.
            </DialogDescription>
          </DialogHeader>

          {!hasRecipients ? (
            <div className="space-y-3 py-2 text-sm text-muted-foreground">
              <p>
                Aucun membre d&apos;équipe disponible pour recevoir un message.
                Ajoutez un caissier ou un administrateur dans l&apos;équipe.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin">Gérer l&apos;équipe →</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Destinataire</Label>
                <Select value={recipientId} onValueChange={setRecipientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un destinataire" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipients.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.firstName} {r.lastName} — {roleLabel(r.role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="msg-title">Objet (optionnel)</Label>
                <Input
                  id="msg-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex. Rupture caisse 2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="msg-body">Message</Label>
                <Textarea
                  id="msg-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Votre message..."
                  rows={4}
                  autoFocus
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>
              Annuler
            </Button>
            {hasRecipients && (
              <Button
                onClick={handleSend}
                disabled={!recipientId || !body.trim() || sendMessage.isPending}
              >
                {sendMessage.isPending ? 'Envoi...' : 'Envoyer'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
