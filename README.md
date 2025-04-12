<p align="center">
  <img src="https://repository-images.githubusercontent.com/947180372/de08b324-c76c-4fd3-9cf6-267062bbd400" alt="TrimLink Logo" width="400"/>
</p>

<h2 align="left">Version 2.0 (In Development)</h2>

<p align="left">
  TrimLink is a full-stack URL shortener with anonymous and authenticated user flows, admin dashboards, Redis caching, and advanced link analytics.
</p>

---

## 📦 Monorepo Structure

```bash
.
├── frontend/      # React + Tailwind + HeroUI frontend (TypeScript)
├── backend/       # Express.js backend (TypeScript)
├── common/        # Shared types & utils
├── redis/         # Redis config (optional)
├── pnpm-workspace.yaml
└── docker-compose.yml (planned)
