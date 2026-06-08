import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { PageHeader } from '../../../components/layout/page-header';
import { usePageTitle } from '../../../hooks/use-page-title';
import { useAuth } from '../../auth/hooks/use-auth';
import { isTenantAdmin } from '../../../lib/roles';
import { ProfileForm } from '../components/ProfileForm';
import { CompanyForm } from '../components/CompanyForm';
import { BrandingForm } from '../components/BrandingForm';
import { PaymentMethodsSection } from '../components/PaymentMethodsSection';
import { SubscriptionPanel } from '../components/SubscriptionPanel';

export function AccountSettingsPage() {
  usePageTitle('Mon compte');
  const { user } = useAuth();
  const isAdmin = isTenantAdmin(user?.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon compte"
        description="Gérez votre profil et les paramètres de votre entreprise"
      />

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="profile">Mon profil</TabsTrigger>
          {isAdmin && <TabsTrigger value="company">Entreprise</TabsTrigger>}
          {isAdmin && <TabsTrigger value="branding">Apparence</TabsTrigger>}
          {isAdmin && <TabsTrigger value="billing">Facturation</TabsTrigger>}
          <TabsTrigger value="subscription">Abonnement</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileForm />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="company" className="mt-6">
            <CompanyForm />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="branding" className="mt-6">
            <BrandingForm />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="billing" className="mt-6">
            <PaymentMethodsSection />
          </TabsContent>
        )}

        <TabsContent value="subscription" className="mt-6">
          <SubscriptionPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
