import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { PageHeader } from '../../../components/layout/page-header';
import { usePageTitle } from '../../../hooks/use-page-title';
import { useAuth } from '../../auth/hooks/use-auth';
import { isTenantAdmin } from '../../../lib/roles';
import { ProfileForm } from '../components/ProfileForm';
import { BrandingForm } from '../components/BrandingForm';

export function AccountSettingsPage() {
  usePageTitle('Mon compte');
  const { user } = useAuth();
  const isAdmin = isTenantAdmin(user?.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon compte"
        description="Votre profil et l'apparence de l'application"
      />

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="profile">Mon profil</TabsTrigger>
          {isAdmin && <TabsTrigger value="branding">Apparence</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileForm />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="branding" className="mt-6">
            <BrandingForm />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
