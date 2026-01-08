# MST - Marty Solar Tracker

Offline-first PWA aplikace pro sledování práce na solárních elektrárnách.

## 🚀 Quick Start

```bash
# Instalace
npm install

# Development
npm run dev

# Build
npm run build

# Type check
npm run typecheck
```

## 📱 Funkce

- **Offline-first** - Funguje i bez internetu
- **PWA** - Instalovatelná na mobil/desktop
- **FieldMap** - Interaktivní mapa stolů
- **Chat** - Týmová komunikace
- **Sync** - Automatická synchronizace s Firebase

## 🏗️ Architektura

```
src/
├── app/           # Hlavní App komponenta
├── application/   # Hooks, view-models, mappers
├── data/          # Dexie DB, repositories
├── domain/        # Business logika (čistá)
├── features/      # UI screens
├── firebase/      # Firebase služby
├── pwa/           # PWA registrace
└── shared/        # UI komponenty, utils
```

### Pravidla
- `domain/` NESMÍ importovat React
- `features/` NESMÍ obsahovat business logiku
- Dexie je JEDINÝ zdroj pravdy
- Firebase je sync adaptér (volitelný)

## 🔥 Firebase Setup

### 1. Aktivace služeb v Firebase Console

1. **Authentication** → Sign-in method:
   - Povolit Email/Password
   - Povolit Google

2. **Firestore Database**:
   - Create database → Start in test mode
   - Deploy pravidla: `firebase deploy --only firestore:rules`

3. **Storage**:
   - Get started → Start in test mode
   - Deploy pravidla: `firebase deploy --only storage`

### 2. Deploy pravidel

```bash
# Instalace Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializace (vybrat existující projekt)
firebase use mst-marty-solar-2025

# Deploy pravidel
firebase deploy --only firestore:rules,storage,firestore:indexes
```

### 3. Deploy aplikace

```bash
# Build
npm run build

# Deploy na Firebase Hosting
firebase deploy --only hosting
```

## 📋 Environment Variables

Konfigurace je v `src/firebase/config.ts` s hardcoded fallback hodnotami.

Pro produkci můžete použít `.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 🎨 Design System

- **Mobile-first** - Optimalizováno pro iPhone
- **iOS-first** - Native iOS look & feel
- **Glassmorphism** - Moderní efekty
- **Tailwind CSS** - Utility-first styling

## 📦 Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Dexie (IndexedDB)
- Firebase (Auth, Firestore, Storage)

## 📄 License

Private - Marty Solar s.r.o.
