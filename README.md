# AgroTrace Platform Documentation

## Platform Overview

AgroTrace is a full-scale agricultural traceability and certification platform that provides tamper-proof tracking of farm products from origin to global markets. The system integrates blockchain anchoring, verifiable credentials, market analytics, weather intelligence, soil analysis, farm certifications, and a mobile-ready QR verification experience.

### Core Purpose
- Transparent farm‑to‑market traceability  
- Certification and inspection workflow with QA agencies  
- Marketplace with real-time pricing in INR (₹)  
- Public tracking and QR verification  
- Weather, soil, and environmental analytics  
- Secure document vault and file management  
- Blockchain‑anchored proof of authenticity  

---

## User Roles

### Exporter
Submits product batches, uploads documents, manages pricing, soil tests, sustainability records, weather data, and receives importer inquiries.

### QA Agency
Conducts inspections, uploads lab reports, records quality metrics, issues Verifiable Credentials, revokes certificates, and anchors them to blockchain.

### Importer
Discovers certified batches, compares prices vs MSP/market, views analytics, sends inquiries, and verifies batches via QR.

### Admin
Manages all users, roles, platform logs, and system-wide operations.

### Public User
Verifies product authenticity via tracking token or QR scan.

---

## Core Features

### Batch Management
- Product details, harvest data, GPS coordinates  
- Attachments (certificates, images, lab reports)  
- Tracking token generation  
- Public traceability portal  
- QR code generation  

### Quality Inspection
- Scheduling  
- Moisture, organic status, pesticides, ISO codes  
- Attachments and lab results  
- Automatic VC issuance  

### Verifiable Credentials
- W3C compliant  
- JSON‑LD format  
- Cryptographically signed  
- Public verification  
- Revocation handling  
- Blockchain anchoring  

### Blockchain Integration
- Anchoring credential hash  
- On-chain timestamp  
- Immutable proof of authenticity  

---

## Agricultural Analytics

### Soil Analysis
Tracks pH, NPK, salinity, organic matter, texture, moisture, and lab data.

### Farm Certifications
Supports organic, ISO, Fair Trade, Rainforest Alliance, GlobalGAP, and more.

### Sustainable Practices
Records water conservation, carbon reduction, pest management, soil health improvements, and environmental impact metrics.

### Weather & Climate
- Manual or auto-fetched via OpenWeatherMap  
- Temperature, humidity, rainfall, winds  
- Auto-fetch edge function  

---

## Marketplace Features

### Pricing in Indian Rupees (₹)
Exporters define:  
- Price per unit  
- MSP, market rate  
- Discounts  
- Availability  
- MOQ  
- Negotiability  

### Importer Tools
- Price vs MSP  
- Price vs Market Rate  
- Trends, analytics, filters  
- "Request Quote" option  

### Inquiry System
Importers submit inquiries for pricing, samples, bulk orders.

---

## Verification System

### Tracking Portal
Public route: `/track/:token`  
Displays product journey, inspection results, certificates, and downloadable PDF.

### QR Code Verification
Scannable QR linking to certificate validity, revocation status, blockchain anchor, and full VC JSON.

---

## Mobile Scanner App (PWA)
- Installable on Android/iOS  
- Works offline  
- Scan history  
- Fast QR verification  
- Auto-routing based on token  

---

## Document Management (Document Vault)
- Upload PDFs, certificates, licenses, lab reports  
- Tags, expiry alerts, version control, secure sharing  
- Bulk operations (delete, download, tag)  
- Access logs and encryption  

---

## Workflows

### Exporter Submits Batch
Submit batch → Upload attachments → Add pricing → Add soil/weather/certifications → Ready for QA.

### QA Inspection
Accept batch → Conduct inspection → Upload evidence → Issue VC → Anchor to blockchain.

### Importer Sourcing
Browse marketplace → Filter + compare → View analytics → Send inquiry → Verify product.

### Public Verification
Token/QR → Product journey → Certificates → Blockchain proof.

---

## Technical Architecture

### Frontend
React, TypeScript, Vite, Tailwind, shadcn/ui, TanStack Query, Zod, React Hook Form, Recharts, PWA.

### Backend
Supabase (Postgres), RLS, Edge Functions (Deno), Storage, OpenWeatherMap API, Blockchain RPC.

### Patterns
RBAC, RLS, secure uploads, audit logs, service worker caching.

---

## Database Schema
Includes:  
- profiles  
- user_roles  
- batches  
- inspections  
- verifiable_credentials  
- market_prices  
- soil_tests  
- farm_certifications  
- sustainable_practices  
- weather_data  
- batch_inquiries  
- document vault tables  
- audit logs  

(Full schema available in codebase.)

---

## API Reference
Covers authentication, fetch queries, edge functions, storage operations, realtime updates.

---

## Environment Setup

```
npm install
npm run dev
npm run build
npm run preview
```

Environment variables:
- VITE_SUPABASE_URL  
- VITE_SUPABASE_PUBLISHABLE_KEY  
- OPENWEATHERMAP_API_KEY  

---

## Deployment
- Build using Vite  
- Deploy frontend to any static hosting  
- Supabase handles backend, edge functions, storage  

---

## Future Enhancements
- Native mobile app  
- IoT farm sensors  
- AI-powered analytics  
- Multi-chain support  
- Smart contract automation  
- Marketplace payments & escrow  

---

## Changelog
### Version 3.0
- PWA  
- Mobile QR scanner  
- Offline support  
- Weather integration  
- Pricing system in ₹  
- Request Quote  
- Batch pricing management  

### Version 2.0
- Market analytics  
- Inquiry system  
- Document vault + versioning  
- Soil, certifications, sustainable practices  

### Version 1.0
- Batch management  
- Inspections  
- Verifiable Credentials  
- Blockchain anchoring  
- Public verification  

---

Maintained by AgroTrace Development Team.
