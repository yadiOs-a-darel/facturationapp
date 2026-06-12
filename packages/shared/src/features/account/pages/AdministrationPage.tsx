import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { PageHeader } from '../../../components/layout/page-header';
import { usePageTitle } from '../../../hooks/use-page-title';
import { CompanyForm } from '../components/CompanyForm';
import { PaymentMethodsSection } from '../components/PaymentMethodsSection';
import { SubscriptionPanel } from '../components/SubscriptionPanel';
import { TeamSection } from '../components/TeamSection';
import { NumberingSection } from '../components/NumberingSection';
import { EmailSettingsSection } from '../components/EmailSettingsSection';

export function AdministrationPage() {
  usePageTitle('Administration');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Paramètres de l'entreprise, de la facturation et de l'équipe"
      />

      <Tabs defaultValue="company">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="company">Entreprise</TabsTrigger>
          <TabsTrigger value="billing">Facturation</TabsTrigger>
          <TabsTrigger value="numbering">Numérotation</TabsTrigger>
          <TabsTrigger value="team">Équipe</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="subscription">Abonnement</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-6">
          <CompanyForm />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <PaymentMethodsSection />
        </TabsContent>

        <TabsContent value="numbering" className="mt-6">
          <NumberingSection />
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <TeamSection />
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <EmailSettingsSection />
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <SubscriptionPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
