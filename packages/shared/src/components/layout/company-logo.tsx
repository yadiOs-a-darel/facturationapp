import { cn } from '../../lib/utils';
import { resolveUploadUrl } from '../../lib/uploads';

function getCompanyInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function CompanyLogo({
  logo,
  companyName,
  className,
  fallbackClassName,
}: {
  logo?: string | null;
  companyName?: string | null;
  className?: string;
  fallbackClassName?: string;
}) {
  const logoUrl = resolveUploadUrl(logo);

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={companyName ? `Logo ${companyName}` : 'Logo entreprise'}
        className={cn('size-10 shrink-0 rounded-lg object-contain bg-background border p-0.5', className)}
      />
    );
  }

  const initials = companyName ? getCompanyInitials(companyName) : 'GF';

  return (
    <div
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary',
        fallbackClassName,
      )}
    >
      <span className="text-base font-bold text-primary-foreground">{initials}</span>
    </div>
  );
}
