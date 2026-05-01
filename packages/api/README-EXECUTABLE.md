# GestFacturation API - Executable Build

Ce package contient l'API backend GestFacturation qui peut être compilée en un exécutable autonome pour Linux, macOS et Windows.

## 🚀 Installation rapide

### Depuis les sources

```bash
# 1. Installer les dépendances
pnpm install

# 2. Générer le client Prisma
pnpm --filter @gestfacturation/database prisma:generate

# 3. Compiler l'exécutable
pnpm build:exe
```

### Commandes disponibles

```bash
# Build toutes les plateformes
pnpm build:exe

# Build pour une plateforme spécifique
pnpm build:exe:linux    # Linux x64
pnpm build:exe:macos    # macOS x64  
pnpm build:exe:win      # Windows x64 (.exe)
```

## 📦 Exécutables générés

Après le build, les exécutables sont dans `packages/api/dist/executables/` :

| Fichier | Plateforme |
|---------|------------|
| `gestfacturation-api-linux-x64` | Linux x64 |
| `gestfacturation-api-macos-x64` | macOS x64 |
| `gestfacturation-api-win.exe` | Windows x64 |

## ⚙️ Configuration

### 1. Copier l'exécutable

```bash
# Linux/macOS
cp dist/executables/gestfacturation-api-linux /opt/gestfacturation/

# Windows
copy dist\executables\gestfacturation-api-win.exe "C:\Program Files\GestFacturation\"
```

### 2. Créer le fichier `.env`

Copiez `.env.example` vers `.env` et configurez :

```bash
PORT=4000
JWT_SECRET=votre-secret-tres-securise
DATABASE_URL=mysql://user:pass@localhost:3306/gestfacturation
NODE_ENV=production
```

### 3. Initialiser la base de données

```bash
# Depuis le root du projet
pnpm --filter @gestfacturation/database prisma:migrate
```

## ▶️ Démarrage

### Linux / macOS

```bash
./gestfacturation-api-linux
# ou
./gestfacturation-api-macos
```

### Windows

```cmd
gestfacturation-api-win.exe
```

L'API est accessible sur `http://localhost:4000`

## 🔧 Options avancées

### Variables d'environnement

Toutes les variables peuvent être passées en CLI :

```bash
# Linux/macOS
PORT=5000 JWT_SECRET=mon-secret ./gestfacturation-api-linux

# Windows (PowerShell)
$env:PORT=5000; $env:JWT_SECRET="mon-secret"; .\gestfacturation-api-win.exe
```

### Mode daemon (Linux)

Pour exécuter en arrière-plan :

```bash
# Avec systemd (recommandé)
sudo systemctl start gestfacturation-api

# Ou avec nohup
nohup ./gestfacturation-api-linux > api.log 2>&1 &
```

## 📝 Notes techniques

### Prisma

Le client Prisma est généré automatiquement pendant le build. Le schéma est inclus dans l'exécutable.

### Fichiers uploads

Le dossier `uploads/` est servi statiquement par l'API. Assurez-vous qu'il existe au même endroit que l'exécutable.

### Compression

Les exécutables sont compressés avec GZip pour réduire leur taille (~30-40% plus petits).

## 🐛 Troubleshooting

### "Prisma Client not found"

Régénérer le client Prisma :
```bash
pnpm --filter @gestfacturation/database prisma:generate
pnpm build:exe
```

### "Port already in use"

Changez le PORT dans le `.env` ou passez-le en CLI.

### Build échoue sur Windows

Assurez-vous d'avoir Node.js 20+ et pnpm installé :
```bash
node --version  # v20.x.x recommandé
pnpm --version
```

## 📄 License

Propriétaire - GestFacturation 2026
