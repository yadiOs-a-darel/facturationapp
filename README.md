# GestFacturation

Application de gestion commerciale **multi-tenant** : clients, produits, factures, stock, achats, dépenses, rapports et paramètres d'entreprise.

## Stack technique

| Couche | Technologies |
|--------|----------------|
| Frontend | React, Vite, TanStack Router, TanStack Query, Tailwind CSS, shadcn/ui |
| Backend | Express.js, JWT, Drizzle ORM, MySQL |
| Monorepo | pnpm workspace |
| Qualité | Biome (lint + format) |

## Structure du monorepo

| Package | Rôle |
|---------|------|
| `apps/web` | Application web (wrapper Vite) |
| `apps/desktop` | Application Electron |
| `packages/shared` | UI, pages, hooks, logique métier |
| `packages/api` | API REST Express |
| `packages/database` | Schéma Drizzle et migrations SQL |

## Prérequis

- Node.js 18+
- pnpm
- MySQL 8+

## Installation

```bash
pnpm install
```

Copier et configurer les variables d'environnement :

```bash
cp packages/api/.env.example packages/api/.env
```

Variables importantes dans `packages/api/.env` :

| Variable | Description |
|----------|-------------|
| `MYSQL_URL` | Connexion MySQL (`mysql://user:pass@localhost:3306/gestionfacturation`) |
| `JWT_SECRET` | Secret de signature des tokens JWT |
| `PORT` | Port API (défaut `4000`) |
| `APP_URL` | URL du frontend (liens e-mail, ex. `http://localhost:5173`) |
| `SMTP_*` | Configuration e-mail globale (optionnel, surchargeable par tenant) |

## Base de données

Appliquer les migrations SQL dans l'ordre (fichiers dans `packages/database/sql/`) :

```bash
mysql -u root -p gestionfacturation < packages/database/sql/002_invoice_customer_nullable.sql
mysql -u root -p gestionfacturation < packages/database/sql/003_complete_billing_system.sql
mysql -u root -p gestionfacturation < packages/database/sql/004_password_reset_tokens.sql
mysql -u root -p gestionfacturation < packages/database/sql/005_notifications.sql
mysql -u root -p gestionfacturation < packages/database/sql/006_tenant_smtp.sql
mysql -u root -p gestionfacturation < packages/database/sql/007_activity_created_by.sql
mysql -u root -p gestionfacturation < packages/database/sql/008_invoice_customer_name.sql
```

Les scripts récents (`008` notamment) sont **idempotents** : une ré-exécution ne provoque pas d'erreur si la colonne existe déjà.

Génération / migration Drizzle (optionnel) :

```bash
pnpm --filter @gestfacturation/database drizzle:generate
pnpm --filter @gestfacturation/database drizzle:migrate
```

## Développement

Lancer l'API et le frontend dans **deux terminaux** :

```bash
pnpm run dev:api   # http://localhost:4000
pnpm run dev:web   # http://localhost:5173 (proxy /api et /uploads → :4000)
```

Optionnel :

```bash
pnpm run dev:desktop
```

Au démarrage, l'application redirige vers `/auth/login` si aucune session valide n'est détectée.

## Fonctionnalités

### Métier

- **Tableau de bord** — indicateurs clés
- **Clients** — fiche client, types (gros, détail, etc.)
- **Produits** — catalogue, prix, TVA, stock
- **Factures** — facture, proforma, devis, avoir ; paiements partiels ; impression/PDF ; envoi e-mail
- **Stock** — mouvements (entrées/sorties) et alertes de rupture
- **Fournisseurs** — référentiel fournisseurs
- **Achats** — bons de commande et réception stock
- **Dépenses** — suivi des charges
- **Rapports** — ventes, TVA, créances

### Facturation

- Client **enregistré** ou **nom saisi librement** (sans créer de fiche client)
- Facture **sans client** possible (`customer_id` nullable)
- Paiement immédiat ou différé, antidatation
- Logo et thème entreprise sur les documents imprimés

### Administration (rôle `ADMIN`)

- **Mon compte** (`/account/settings`) — profil, entreprise, apparence, modes de paiement
- **Administration** (`/admin`) — équipe, numérotation, configuration e-mail SMTP par tenant
- **Journal caisse** (`/cashier-journal`) — activité quotidienne caisse, export e-mail

### Authentification et sécurité

- Connexion JWT (`localStorage` : `gestfacturation_token`)
- Mot de passe oublié / réinitialisation par e-mail
- Rôles : `SUPER_ADMIN`, `ADMIN`, `CASHIER`
- Validation de licence à l'inscription

### Notifications

- Cloche dans la sidebar : messages internes et alertes stock
- Lecture / réponse aux messages entre utilisateurs

### Listes et pagination

- **15 lignes par page** sur toutes les listes (factures, produits, clients, stock, etc.)
- Tri par défaut : **du plus récent au plus ancien**
- Navigation Précédent / Suivant en bas de chaque liste

## Routes frontend

| Route | Description | Accès |
|-------|-------------|-------|
| `/` | Tableau de bord | Authentifié |
| `/customers` | Clients | Authentifié |
| `/products` | Produits | Authentifié |
| `/invoices` | Factures | Authentifié |
| `/invoices/$id/print` | Impression facture | Authentifié |
| `/stock` | Stock | Authentifié |
| `/suppliers` | Fournisseurs | Authentifié |
| `/purchase-orders` | Bons de commande | Authentifié |
| `/expenses` | Dépenses | Authentifié |
| `/reports` | Rapports | Authentifié |
| `/cashier-journal` | Journal caisse | Admin |
| `/account/settings` | Mon compte | Authentifié |
| `/admin` | Administration | Admin |
| `/auth/login` | Connexion | Public |
| `/auth/register-tenant` | Inscription entreprise | Public |
| `/auth/forgot-password` | Mot de passe oublié | Public |
| `/auth/reset-password` | Réinitialisation mot de passe | Public |
| `/auth/license` | Validation licence | Public |

## API principale

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | Connexion |
| `POST /api/auth/register-tenant` | Création entreprise |
| `GET /api/auth/session` | Session courante |
| `POST /api/auth/forgot-password` | Demande réinitialisation |
| `POST /api/auth/reset-password` | Nouveau mot de passe |
| `GET/PUT /api/tenants/me` | Infos entreprise |
| `GET/PUT /api/tenants/me/email-settings` | SMTP tenant |
| `POST /api/tenants/me/email-settings/test` | Test e-mail |
| `POST /api/tenants/me/logo` | Upload logo |
| `GET/PUT /api/users/me` | Profil utilisateur |
| `PUT /api/users/me/password` | Changement mot de passe |
| `/api/customers` | Clients (pagination `page`, `limit`) |
| `/api/products` | Produits |
| `/api/invoices` | Factures |
| `/api/stock` | Mouvements et alertes stock |
| `/api/suppliers` | Fournisseurs |
| `/api/purchase-orders` | Bons de commande |
| `/api/expenses` | Dépenses |
| `/api/reports` | Rapports et journal caisse |
| `/api/notifications` | Notifications |
| `/uploads/*` | Fichiers statiques (logos, pièces jointes) |

Paramètres de pagination communs : `page` (défaut `1`), `limit` (défaut `15`, max `100`).

## Scripts utiles

```bash
pnpm run build          # Build production (shared + web)
pnpm run build:api:exe  # Exécutable API standalone
pnpm run lint           # Lint Biome (avec corrections)
pnpm run lint:check     # Lint sans correction
pnpm run format         # Formatage Biome
```

## Build exécutable API

Voir [packages/api/README-EXECUTABLE.md](packages/api/README-EXECUTABLE.md).

## Architecture frontend

Le package `@gestfacturation/shared` contient toute la logique applicative. L'app web (`apps/web`) importe uniquement `<App />` depuis ce package.

- Composants UI : `packages/shared/src/components/ui/`
- Pages : `packages/shared/src/features/*/pages/`
- Hooks API : `packages/shared/src/features/*/hooks/`
- Routes : `packages/shared/src/app/routes.tsx`

## Licence

Projet privé — usage interne.
