# GestFacturation

Application de gestion commerciale multi-tenant : clients, produits, factures, stock et paramètres d'entreprise.

## Stack technique

- **Frontend** : React, Vite, TanStack Router, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend** : Express.js, JWT, Drizzle ORM, MySQL
- **Monorepo** : pnpm workspace

## Structure du monorepo

| Package | Rôle |
|---------|------|
| `apps/web` | Application web (wrapper Vite) |
| `apps/desktop` | Application Electron |
| `packages/shared` | UI, pages, hooks, logique métier |
| `packages/api` | API REST Express |
| `packages/database` | Schéma et migrations Drizzle |

## Prérequis

- Node.js 18+
- pnpm
- MySQL

## Installation

```bash
pnpm install
```

Copier les fichiers d'environnement :

```bash
cp packages/api/.env.example packages/api/.env
cp packages/shared/.env.example packages/shared/.env
cp apps/web/.env.example apps/web/.env
```

Configurer notamment `DATABASE_URL`, `JWT_SECRET` et `VITE_API_URL`.

## Développement

Lancer l'API et le frontend dans deux terminaux :

```bash
pnpm run dev:api   # http://localhost:4000
pnpm run dev:web   # http://localhost:5173 (proxy /api et /uploads vers :4000)
```

Optionnel :

```bash
pnpm run dev:desktop
```

## Fonctionnalités principales

- **Tableau de bord** — indicateurs et rapports
- **Clients** — gestion de la clientèle
- **Produits** — catalogue et tarifs
- **Factures** — création, paiements, impression/PDF avec logo entreprise
- **Stock** — mouvements et alertes
- **Mon compte** (`/account/settings`) — profil utilisateur et paramètres entreprise

### Mon compte

Accessible via le menu utilisateur en bas de la sidebar.

| Onglet | Contenu | Accès |
|--------|---------|-------|
| Mon profil | Prénom, nom, téléphone, mot de passe | Tous |
| Entreprise | Raison sociale, NIF, adresse, coordonnées | Admin |
| Apparence | Logo (fichier), couleur du thème, police | Admin |
| Facturation | Modes de paiement | Admin |
| Abonnement | Plan et limites (lecture seule) | Tous |

**Branding entreprise :**

- Logo uploadé (JPG, PNG, GIF, WebP, SVG — max 2 Mo) → affiché dans la sidebar et sur les factures
- 8 thèmes de couleur : turquoise, bleu, vert, jaune, orange, rouge, violet, rose
- 4 polices : Moderne (Geist), Épurée (Mona Sans), Classique (Merriweather), Système

## Routes frontend

| Route | Description |
|-------|-------------|
| `/` | Tableau de bord |
| `/customers` | Clients |
| `/products` | Produits |
| `/invoices` | Factures |
| `/stock` | Stock |
| `/account/settings` | Mon compte |
| `/auth/login` | Connexion |
| `/auth/register-tenant` | Inscription entreprise |
| `/auth/license` | Validation de licence |

## API principale

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | Connexion |
| `POST /api/auth/register-tenant` | Création entreprise |
| `GET /api/auth/session` | Session courante |
| `GET/PUT /api/tenants/me` | Infos et paramètres entreprise |
| `POST /api/tenants/me/logo` | Upload du logo |
| `GET/PUT /api/users/me` | Profil utilisateur |
| `PUT /api/users/me/password` | Changement de mot de passe |
| `/api/customers`, `/api/products`, `/api/invoices`, `/api/stock` | Modules métier |
| `/uploads/*` | Fichiers statiques (logos, pièces jointes) |

## Scripts utiles

```bash
pnpm run build          # Build production (shared + web)
pnpm run lint           # Lint Biome
pnpm run lint:check     # Lint sans correction
pnpm run format         # Formatage Biome
pnpm run drizzle:generate
pnpm run drizzle:migrate
```

## Build exécutable API

Voir [packages/api/README-EXECUTABLE.md](packages/api/README-EXECUTABLE.md).

## Authentification

- Token JWT stocké dans `localStorage` (`gestfacturation_token`)
- Rôles : `SUPER_ADMIN`, `ADMIN`, `CASHIER`
- Les paramètres entreprise (branding, coordonnées) sont modifiables par `ADMIN` et `SUPER_ADMIN`
