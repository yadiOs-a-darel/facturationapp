export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  fontFamily?: string | null;
  legalName?: string | null;
  taxNumber?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  plan?: string | null;
  planStatus?: string | null;
  trialEndsAt?: string | null;
  subscriptionEndsAt?: string | null;
  maxUsers: number;
  maxProducts: number;
  createdAt: string;
  updatedAt: string;
}

export type TenantUpdatePayload = Partial<
  Pick<
    Tenant,
    | 'name'
    | 'legalName'
    | 'taxNumber'
    | 'address'
    | 'city'
    | 'country'
    | 'phone'
    | 'email'
    | 'website'
    | 'logo'
    | 'primaryColor'
    | 'secondaryColor'
    | 'fontFamily'
  >
>;

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatar?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export type ProfileUpdatePayload = Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'phone'>>;

export interface PasswordUpdatePayload {
  currentPassword: string;
  newPassword: string;
}
