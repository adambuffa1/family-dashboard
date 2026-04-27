# Rodinný Dashboard – Návod na spustenie

## Požiadavky
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- npm alebo yarn

## Inštalácia a spustenie

### 1. Nainštalujte závislosti
```bash
npm install
```

### 2. Nastavte databázu
```bash
npm run db:push
```
Príkaz vytvorí SQLite databázu `prisma/dev.db`.

### 3. Naplňte databázu vzorovými dátami
```bash
npm run db:seed
```
Vytvorí:
- Admin: `admin` / `admin`
- Používateľ: `pouzivatel` / `pouzivatel123`
- Vzorové výdavky, recepty, merania

### 4. Spustite vývojový server
```bash
npm run dev
```

Otvorte [http://localhost:3000](http://localhost:3000)

---

## Prihlasovacie údaje
| Rola | Meno | Heslo |
|------|------|-------|
| Admin | `admin` | `admin` |
| Používateľ | `pouzivatel` | `pouzivatel123` |

---

## Funkcie

### Financie
- Pridávanie výdavkov s kategóriami (Jedlo, Zábava, Domácnosť, Pes, Ostatné)
- Skenovanie dokladov pomocou OCR (Tesseract.js) – automatické vyplnenie sumy a dátumu
- Mesačný rozpočet per kategória – nastavenie limitov a sledovanie plnenia
- Grafy: koláčový (výdavky podľa kategórie) + stĺpcový (rozpočet vs. skutočnosť)
- Navigácia po mesiacoch

### Kuchárka
- Recepty v kategóriách: Polievky / Hlavné jedlá / Rýchle večere
- Pridávanie receptov: názov, foto, ingrediencie, automaticky číslované kroky
- Vyhľadávanie podľa názvu alebo ingrediencie
- Detailný pohľad na recept
- Úprava a mazanie (iba vlastník alebo admin)

### Energia
- Sledovanie: Elektrina (kWh) / Plyn (m³) / Voda (m³)
- OCR skenovanie fotky merača – automatické vyplnenie hodnoty
- Tabuľka s nekonečným scrollom
- Čiarový graf vývoja spotreby

### Správca (iba admin)
- Zobrazenie všetkých používateľov
- Pridávanie nových používateľov
- Zmena hesla
- Zmena role (user/admin)
- Mazanie používateľov

---

## Štruktúra projektu
```
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Chránené stránky dashboardu
│   │   ├── financie/       # Modul financií
│   │   ├── kucharka/       # Modul kuchárky
│   │   ├── energia/        # Modul energie
│   │   └── admin/          # Admin panel
│   ├── api/                # REST API endpointy
│   └── prihlasenie/        # Prihlasovacia stránka
├── components/             # React komponenty
│   ├── financie/           # Komponenty pre financie
│   ├── kucharka/           # Komponenty pre kuchárku
│   ├── energia/            # Komponenty pre energiu
│   └── ui/                 # Zdieľané UI komponenty
├── lib/                    # Pomocné funkcie (DB, auth)
├── prisma/                 # Databázová schéma a seed
├── types/                  # TypeScript typy
└── public/uploads/         # Nahrané súbory
```

## Technológie
- **Next.js 14** (App Router)
- **Prisma + SQLite** (databáza)
- **Tailwind CSS** (štýlovanie)
- **Recharts** (grafy)
- **Tesseract.js** (OCR)
- **jose + bcryptjs** (autentifikácia)
- **Lucide React** (ikony)
