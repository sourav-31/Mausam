# 🌦️ Mausam 2.0 (मौसम) — Hyper-Personalized Meteorological Intelligence & Real-Time Radar Platform

<p align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/cloud-sun-rain.svg" alt="Mausam 2.0 Logo" width="80" height="80" />
</p>

<p align="center">
  <strong>Next-Generation Weather Intelligence: Transforming Raw Atmospheric Data into Actionable, Health-Aware, and Routine-Optimized Daily Guidance.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Ready-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Google_Gemini-1.5_Flash-8E75C2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Vercel-Deployable-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## 📑 Table of Contents

- [🌟 Project Overview](#-project-overview)
- [✨ Key Features](#-key-features)
  - [1. Atmospheric Dashboard \& Micro-Trends](#1-atmospheric-dashboard--micro-trends)
  - [2. Interactive Doppler Radar \& 60 FPS Thermal Heatmap](#2-interactive-doppler-radar--60-fps-thermal-heatmap)
  - [3. Copernicus Air Quality \& Bio-Allergen Telemetry](#3-copernicus-air-quality--bio-allergen-telemetry)
  - [4. Context-Aware Mausam AI Assistant](#4-context-aware-mausam-ai-assistant)
  - [5. Personalized Routine \& Health Profiles](#5-personalized-routine--health-profiles)
  - [6. Transparent Documentation Hub](#6-transparent-documentation-hub)
- [🧠 Proprietary Intelligence Engines](#-proprietary-intelligence-engines)
- [🏗️ System Architecture](#️-system-architecture)
- [📁 Repository Structure](#-repository-structure)
- [💻 Technology Stack](#-technology-stack)
- [🗄️ Database Schema](#️-database-schema)
- [🔌 API Reference](#-api-reference)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation \& Environment Setup](#installation--environment-setup)
  - [Database Migration](#database-migration)
  - [Running Locally](#running-locally)
- [🌐 Deployment Guide](#-deployment-guide)
- [🧪 Testing \& Quality Assurance](#-testing--quality-assurance)
- [📜 External Data Providers \& Licensing](#-external-data-providers--licensing)
- [🤝 Contributing \& Author](#-contributing--author)

---

## 🌟 Project Overview

Traditional meteorological applications present users with raw, detached figures: *"29°C, 72% humidity, 1013 hPa"*. For everyday citizens, students, farmers, long-distance commuters, and individuals with respiratory or joint ailments, these numbers fail to answer the critical questions:

> *"Is it safe for my morning run given the PM2.5 levels?"*  
> *"Will sudden pressure drops trigger my migraine or joint aches today?"*  
> *"Should I irrigate crops or spray pesticides this afternoon?"*  
> *"What is the safest 2-hour window for an outdoor commute?"*

**Mausam 2.0** solves this paradigm by coupling high-resolution numerical weather prediction (NWP) models with **custom algorithmic intelligence engines** and **Google Gemini 1.5 Flash**. By correlating real-time atmospheric conditions with personalized health profiles and daily routines, Mausam 2.0 transforms cold meteorological numbers into actionable, preventive lifestyle advice.

---

## ✨ Key Features

### 1. Atmospheric Dashboard & Micro-Trends
- **Live Readings**: Real-time ambient temperature, apparent "feels-like" temperature (incorporating Wind Chill and Humidex), humidity, barometric surface pressure, wind velocity, and UV index.
- **Micro-Trend Timeline**: Hour-by-hour forecast scrubber featuring weather condition icons, precipitation probabilities, and temperature delta curves.
- **7-Day Synoptic Outlook**: High/low temperature ranges, rain probability bars, and dominant atmospheric patterns for weekly planning.
- **Sun & Lunar Astronomy**: Sunrise, sunset, daylight duration calculation, and golden hour indicators.
- **Metric / Imperial Toggling**: Instant Celsius (`°C`) and Fahrenheit (`°F`) switching across all components without page reloads.

### 2. Interactive Doppler Radar & 60 FPS Thermal Heatmap (`/radar`)
- **RainViewer Doppler Radar**: Seamless aggregation of over 1,000+ terrestrial radar stations worldwide (NOAA NEXRAD, OPERA, IMD, JMA).
- **Time Slider & Automated Nowcast**: Animated playback of past 10-minute radar frames alongside a 30-minute predictive storm nowcast.
- **Continuous 60 FPS Thermal Heatmap (`TemperatureRasterLayer`)**: Custom HTML5 Canvas raster layer utilizing **Inverse Distance Weighting (IDW)** interpolation to generate smooth, continuous thermal heat gradients across regional geographies.
- **Click-to-Inspect Microclimate**: Click anywhere on the global map to trigger instant reverse geocoding via BigDataCloud and inspect hyper-local weather telemetry on demand.
- **Layer Controls**: Seamless toggling between Doppler Precipitation, Thermal Heatmap, Wind Vectors, and Severe Rain Alert circles.

### 3. Copernicus Air Quality & Bio-Allergen Telemetry
- **Atmospheric Chemistry**: Real-time European Air Quality Index (AQI), PM2.5, PM10, Nitrogen Dioxide ($\text{NO}_2$), Sulphur Dioxide ($\text{SO}_2$), Carbon Monoxide ($\text{CO}$), and Ground-level Ozone ($\text{O}_3$).
- **Bio-Allergen Monitoring**: Real-time grass pollen and birch pollen dispersion indices calculated via the Finnish Meteorological Institute SILAM dispersion model.

### 4. Context-Aware Mausam AI Assistant
- **Floating Global Widget**: Accessible across any page for conversational meteorological inquiries.
- **Dual-Engine Pipeline**:
  - **Primary**: Google Gemini 1.5 Flash via REST integration with temperature sampling ($0.7$), Top-K ($40$), and Top-P ($0.95$).
  - **Offline/Zero-Key Fallback**: In-house heuristic knowledge base (`knowledge.ts`) covering 100+ meteorological, agricultural, athletic, and travel rules.
- **Context Injection (`WeatherContextService`)**: Ingests the user's active coordinate forecast (24-hour hourly temperatures, rain probabilities, PM2.5 levels) along with their saved health conditions to compute optimal outdoor activity windows and preventive health alerts.

### 5. Personalized Routine & Health Profiles
- **Multi-Step Onboarding**:
  - **Routine Profiling**: Student, Office Worker, Remote Worker, Outdoor Laborer, Commuter, Athlete, Fitness Enthusiast. Commute modalities (Walking, Bicycle, Scooter, Car, Transit) and preferred time slots.
  - **Health Profiles**: Non-invasive tracking of respiratory sensitivities (Asthma, Dust/Pollen allergies), Migraines, Joint/Rheumatic discomfort, and Heat/Cold sensitivities.
- **Saved Locations**: Multi-location management (Home, Work, Campus, Travel destinations) with quick primary toggles.

### 6. Transparent Documentation Hub (`/documentation`)
- In-app interactive documentation detailing every third-party API, meteorological model (ECMWF, GFS, ICON), update cadence, geographic resolution, live request/response samples, and licensing attribution.

---

## 🧠 Proprietary Intelligence Engines

Located in `backend/src/engines/` and `backend/src/services/`:

```
                    ┌────────────────────────┐
                    │ Raw Weather Telemetry  │
                    │  (Open-Meteo & CAMS)   │
                    └───────────┬────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│ InsightEngine │       │PriorityEngine │       │WeatherContext │
│(Health & Bioc)│       │(Alert Scoring)│       │(Window Scorer)│
└───────┬───────┘       └───────┬───────┘       └───────┬───────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
                  ┌───────────────────────────┐
                  │   PersonalizationEngine   │
                  │   Dynamic UI Composition  │
                  └─────────────┬─────────────┘
                                ▼
                  ┌───────────────────────────┐
                  │  Mausam AI Chat / Client  │
                  └───────────────────────────┘
```

1. **`InsightEngine.ts`**:
   - Computes biometeorological discomfort based on thresholds (extreme heat $>38^\circ\text{C}$, UV index $\ge 7$, precipitation probability $>50\%$, and severe convective winds $>40\text{ km/h}$).
   - Tailors dynamic advice based on primary user roles (e.g., advising farmers on irrigation postponements, warning students about rain commute times).
2. **`PriorityEngine.ts`**:
   - Dynamically calculates priority weights ($0$ to $100$) for frontend widgets (e.g., elevating radar alerts during flash storms, prioritizing UV cards during midday heatwaves).
3. **`PersonalizationEngine.ts`**:
   - Synthesizes user identity, greeting rules, insight blocks, and priority scores to construct customized dashboard JSON payloads for `/api/personalized-home`.
4. **`weatherContext.service.ts`**:
   - Analyzes 24-hour temporal projections against user health conditions. Computes numerical fitness scores ($0$–$10$) for each hour to recommend the exact best window for outdoor exercise (e.g., *"Best walk window: 7:00 AM – 9:00 AM"*).

---

## 🏗️ System Architecture

Mausam 2.0 is designed as a **TypeScript Monorepo**:

- **Frontend**: Single Page Application built with **React 19**, **Vite**, **React Router v7**, and **Tailwind CSS**. Map visualizations are rendered with **Leaflet** and **React-Leaflet** with custom canvas raster pipelines.
- **Backend API**: **Express 5** application in TypeScript, leveraging **Prisma ORM** connected to **PostgreSQL**.
- **Serverless Adapter**: An `/api/index.ts` entrypoint allowing the backend to run on **Vercel Serverless Functions** without code divergence from the standalone Node.js server.

---

## 📁 Repository Structure

```text
Mausam-2.0/
├── api/                            # Vercel Serverless Function adapter
│   └── index.ts                    # Re-exports Express app for serverless execution
├── backend/                        # Express 5 + TypeScript backend service
│   ├── prisma/
│   │   ├── schema.prisma           # Prisma PostgreSQL data models
│   │   └── seed.ts                 # Database seeding script
│   ├── src/
│   │   ├── controllers/            # Request handlers (auth, weather, onboarding, etc.)
│   │   ├── engines/                # InsightEngine, PersonalizationEngine, PriorityEngine
│   │   │   └── __tests__/          # Jest unit tests for engines
│   │   ├── middleware/             # JWT authentication middleware
│   │   ├── providers/              # OpenMeteoProvider weather adapter
│   │   ├── routes/                 # Express API routes (/auth, /weather, /chat, etc.)
│   │   ├── services/               # WeatherContextService, Knowledge Base, Prisma client
│   │   ├── types/                  # Shared TypeScript interfaces
│   │   └── index.ts                # Express application bootstrap & CORS setup
│   ├── .env.example                # Backend environment template
│   ├── package.json
│   └── tsconfig.json
├── frontend/                       # Vite + React 19 SPA frontend
│   ├── public/                     # Static assets (favicons, icons)
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ui/                 # Radix / Tailwind UI primitives (Cards, Buttons, etc.)
│   │   │   ├── ChatbotWidget.tsx   # Global conversational AI weather widget
│   │   │   ├── LocationModal.tsx   # GPS and city selection modal
│   │   │   └── TemperatureRasterLayer.tsx # 60fps Canvas IDW heatmap layer
│   │   ├── contexts/               # React contexts (AuthContext, LocationContext)
│   │   ├── lib/                    # Weather code helpers, icon resolvers, utility functions
│   │   ├── pages/                  # Route view components
│   │   │   ├── LandingPage.tsx     # Primary atmospheric dashboard & tabs
│   │   │   ├── RadarPage.tsx       # RainViewer Doppler radar & interactive maps
│   │   │   ├── DocumentationPage.tsx # Data source directory, API docs, & transparency
│   │   │   ├── AuthPage.tsx        # Login & user registration
│   │   │   ├── OnboardingPage.tsx  # Daily routine configuration
│   │   │   ├── HealthProfilePage.tsx # Medical & sensitivity configuration
│   │   │   └── PersonalizedHome.tsx  # Tailored home layout
│   │   ├── services/               # API clients (api.ts, weather.service.ts, chat.service.ts)
│   │   ├── App.tsx                 # Route declarations & auth guards
│   │   └── main.tsx                # React DOM root mounting
│   ├── package.json
│   ├── tailwind.config.cjs
│   └── vite.config.ts
├── dist/                           # Compiled production frontend build
├── package.json                    # Monorepo root scripts & dependencies
├── vercel.json                     # Vercel deployment routing & build specifications
└── README.md                       # Project documentation
```

---

## 💻 Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) | High-performance UI rendering with concurrent features & hooks |
| **Bundler & Tooling** | [Vite 8](https://vitejs.dev/) | Instant HMR development server and fast production bundler |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) | End-to-end type safety across client and server |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) | Modern utility-first responsive styling with animations |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/) | Clean, consistent SVG icon system |
| **Charts** | [Recharts](https://recharts.org/) | Declarative chart rendering for 24-hour trends |
| **Maps & Cartography** | [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/) | Interactive mapping canvas with custom raster overlays |
| **Backend Framework** | [Express 5](https://expressjs.com/) | REST API server with routing and middleware architecture |
| **Database & ORM** | [Prisma 5.22](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/) | Type-safe queries, relational schema migrations, and relations |
| **Security & Auth** | [JSON Web Tokens (JWT)](https://jwt.io/) & [bcrypt](https://www.npmjs.com/package/bcrypt) | Secure stateless token authentication and password hashing |
| **Generative AI** | [Google Gemini 1.5 Flash](https://ai.google.dev/) | High-speed, multimodal LLM for meteorological chat synthesis |
| **Radar Provider** | [RainViewer API](https://www.rainviewer.com/api.html) | Global weather radar mosaic with past & nowcast tiles |
| **Forecast Provider** | [Open-Meteo](https://open-meteo.com/) | Non-commercial high-precision global atmospheric telemetry |
| **Air Quality** | [Copernicus CAMS](https://atmosphere.copernicus.eu/) | European atmospheric monitoring & pollen dispersion data |
| **Geocoding** | [Open-Meteo Geo](https://open-meteo.com/) & [BigDataCloud](https://www.bigdatacloud.net/) | Name resolution and client reverse coordinate lookup |

---

## 🗄️ Database Schema

The database schema is defined in [`backend/prisma/schema.prisma`](file:///e:/Mausam%202.0/Mausam-2.0/backend/prisma/schema.prisma):

```mermaid
erDiagram
    User ||--o| UserProfile : has
    User ||--o{ WeatherPreference : configures
    User ||--o{ SavedLocation : saves
    User ||--o{ Notification : receives
    User ||--o| UserSettings : specifies
    User ||--o| UserRoutine : follows
    User ||--o| UserHealthProfile : records

    User {
        String id PK
        String email UK
        String password
        String name
        String onboardingStatus
        DateTime createdAt
        DateTime updatedAt
    }

    UserProfile {
        String id PK
        String userId FK
        String primaryProfile
    }

    UserRoutine {
        String id PK
        String userId FK
        String[] routineTypes
        String[] activities
        String activityFrequency
        String preferredTime
        String commuteMethod
        Boolean skipped
    }

    UserHealthProfile {
        String id PK
        String userId FK
        String[] allergies
        String[] healthConditions
        String[] weatherSensitivities
        Boolean skipped
    }

    SavedLocation {
        String id PK
        String userId FK
        String name
        String city
        Float latitude
        Float longitude
        Boolean isPrimary
    }
```

---

## 🔌 API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Create a new user account | No |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user details and profile | Yes (`Bearer`) |
| `POST` | `/api/auth/explore-demo` | One-click guest session generation | No |

### 🌤️ Weather & Geocoding (`/api/weather`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/weather/forecast` | Returns current, hourly, and daily forecasts for given `latitude` & `longitude` | No |
| `GET` | `/api/weather/location/search` | Search cities and locations by query string | No |
| `GET` | `/api/weather/location/reverse` | Reverse geocode coordinates to settlement names | No |

### 🤖 AI Conversational Assistant (`/api/chat`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/chat` | Chat query pipeline. Ingests message history, GPS coordinates, and user profile; analyzes atmospheric health safety and returns Gemini 1.5 Flash or local fallback response | Optional (enhances context) |

### 📋 Onboarding & Personalization
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/onboarding/status` | Retrieves current onboarding step completion state | Yes (`Bearer`) |
| `POST` | `/api/onboarding/routine` | Saves user routine types, commute style, and activity slots | Yes (`Bearer`) |
| `POST` | `/api/onboarding/routine/skip` | Marks routine onboarding step as skipped | Yes (`Bearer`) |
| `POST` | `/api/onboarding/health` | Saves user allergies, medical conditions, and sensitivities | Yes (`Bearer`) |
| `POST` | `/api/onboarding/health/skip` | Marks health onboarding step as skipped | Yes (`Bearer`) |
| `GET` | `/api/personalized-home` | Returns personalized component layout & biometeorological scores | Yes (`Bearer`) |

### 💓 Health Check
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Returns server status `{"status": "ok"}` | No |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm** or **yarn** / **pnpm**
- **PostgreSQL**: Local instance or cloud database (e.g. Neon, Supabase, Railway)

### Installation & Environment Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sourav-31/Mausam.git
   cd Mausam
   ```

2. **Install Root Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Backend Environment**:
   Create a `.env` file in the `backend/` directory (refer to `backend/.env.example`):
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:password@localhost:5432/mausam?schema=public"
   JWT_SECRET="your_jwt_secret_key_here"

   # Optional: Free key from https://aistudio.google.com/app/apikey
   # If omitted, Mausam automatically uses its built-in local knowledge engine fallback.
   GEMINI_API_KEY="your_free_gemini_api_key"
   ```

4. **Configure Frontend Environment** (Optional for local dev):
   Create a `.env` file in the `frontend/` directory if connecting to an external backend:
   ```env
   VITE_API_URL="http://localhost:5000/api"
   ```

### Database Migration

Generate Prisma client and push the schema to your PostgreSQL database:

```bash
# From the backend directory:
cd backend
npx prisma generate
npx prisma db push
cd ..
```

*(Optional) Seed the database:*
```bash
npm run prisma:seed --workspace=backend
```

### Running Locally

You can run both backend and frontend concurrently in two separate terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Vite client will launch on http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser.

---

## 🌐 Deployment Guide

### Deploying to Vercel

Mausam 2.0 comes preconfigured with a root [`vercel.json`](file:///e:/Mausam%202.0/Mausam-2.0/vercel.json) file:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

1. Push your repository to GitHub.
2. Import the project into your [Vercel Dashboard](https://vercel.com).
3. Set your Environment Variables in Vercel project settings:
   - `DATABASE_URL` (Connection string to cloud PostgreSQL)
   - `JWT_SECRET` (A strong random secret string)
   - `GEMINI_API_KEY` (Your Google AI Studio Gemini API key)
4. Deploy! Vercel will build the frontend into `dist/` and expose the Express backend through `/api/index.ts` as serverless functions.

---

## 🧪 Testing & Quality Assurance

- **Unit Testing**: Jest test suites verify the behavior of `InsightEngine` and `PersonalizationEngine`:
  ```bash
  npm run test --workspace=backend
  ```
- **Linting**: High-speed linting powered by [Oxlint](https://oxc.rs/):
  ```bash
  npm run lint --workspace=frontend
  ```
- **Type Checking**:
  ```bash
  npx tsc --noEmit --project frontend/tsconfig.app.json
  npx tsc --noEmit --project backend/tsconfig.json
  ```

---

## 📜 External Data Providers & Licensing

Mausam 2.0 leverages authoritative, open-access meteorological data providers:

| Provider | Data Domain | Attribution & Licensing |
| :--- | :--- | :--- |
| **Open-Meteo GmbH** | Weather Forecasts, Solar Radiation, UV | [Open-Meteo](https://open-meteo.com) (CC BY 4.0) |
| **RainViewer Inc.** | Doppler Radar Mosaic & Predictive Nowcast | [RainViewer API](https://www.rainviewer.com) |
| **Copernicus CAMS** | Air Quality, Aerosols, Gas Concentrations | [Copernicus Atmosphere Service](https://atmosphere.copernicus.eu) |
| **OpenStreetMap** | Cartographic Base Map Tiles | © [OpenStreetMap](https://www.openstreetmap.org) contributors (ODbL) |
| **BigDataCloud** | Reverse Geocoding API | [BigDataCloud Pty Ltd](https://www.bigdatacloud.net) (Client Geocoding) |
| **Google DeepMind** | Gemini 1.5 Flash Generative AI | [Google AI Studio](https://ai.google.dev) |

---

## 🤝 Contributing & Author

Contributions, issues, and feature suggestions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="center">
  Built with ❤️ for a more weather-resilient, health-informed world.<br/>
  <strong>Mausam 2.0 — Precision Atmospheric Intelligence.</strong>
</p>
