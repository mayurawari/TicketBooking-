# TicketPass — Production Deployment Guide

This guide provides step-by-step instructions for deploying both the **Express Backend** and **Next.js Frontend** to modern cloud platforms with zero downtime.

---

## Architecture Summary

| Component | Stack | Recommended Host | Free Tier Available |
| :--- | :--- | :--- | :---: |
| **Backend API** | Node.js 22, Express 5, Prisma 7 | [Render](https://render.com) or [Railway](https://railway.app) | Yes |
| **Frontend** | Next.js 16 (Turbopack), React 19, Tailwind v4 | [Vercel](https://vercel.com) | Yes |
| **Database** | PostgreSQL Serverless with Connection Pooling | [Neon](https://neon.tech) | Yes |

---

## 1. Backend Deployment (Render or Railway)

### Step 1: Deploy to Render / Railway
1. Push your repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** &rarr; **Web Service**.
3. Connect your repository.
4. Set the configuration:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `pnpm install && pnpm run build`
   - **Start Command:** `pnpm start`
   - **Health Check Path:** `/health`

### Step 2: Configure Backend Environment Variables
In the service **Environment** tab, add the following:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Production environment flag | `production` |
| `DATABASE_URL` | Neon PostgreSQL pooled URL | `postgresql://user:pass@ep-cool-fog.neon.tech/neondb?sslmode=require` |
| `KEY` | Secure JWT signing key (min 32 chars) | `generate_a_random_64_char_hex_string` |
| `CLIENT_URL` | Your frontend deployment URL | `https://your-app.vercel.app` |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins | `https://your-app.vercel.app,http://localhost:3000` |
| `PORT` | Service port | *(Assigned automatically by Render/Railway)* |
| `TMDB_API_KEY` | *(Optional)* For live TMDB sync | `your_tmdb_api_key_here` |

### Step 3: Seed Database in Production
Once the backend builds, open the Render **Shell** tab or run locally using production `DATABASE_URL`:
```bash
# Push Prisma schema and partial unique indexes
pnpm run db:push

# Seed 15 Metro Cities, 37 Multiplexes, and 111 Screenings
pnpm run seed
```

---

## 2. Frontend Deployment (Vercel)

### Step 1: Import Project into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** &rarr; **Project**.
2. Select your repository.
3. In **Project Configuration**:
   - **Root Directory:** Click edit and choose `frontend`.
   - **Framework Preset:** `Next.js`
   - **Build Command:** `next build` (default)
   - **Install Command:** `pnpm install` (default)

### Step 2: Configure Frontend Environment Variables
Add the following variable:

| Variable | Description | Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Public URL of your deployed backend | `https://your-backend-api.onrender.com` |

4. Click **Deploy**. Vercel will build and assign a production URL (e.g. `https://ticketpass.vercel.app`).

### Step 3: Update Backend CORS
After Vercel assigns your live URL, update the `CLIENT_URL` and `ALLOWED_ORIGINS` on your Render/Railway backend with your live Vercel domain.

---

## 3. Docker / Self-Hosted VPS Deployment

For VPS hosting (Ubuntu, DigitalOcean Droplet, AWS EC2, Google Cloud Compute):

### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/your-username/TicketBooking-.git
cd TicketBooking-
```

Create `.env` at root:
```env
DATABASE_URL="postgresql://user:password@your-neon-host/neondb?sslmode=require"
KEY="your_super_secret_jwt_key_here"
```

### Step 2: Build and Run with Docker Compose
```bash
docker compose up -d --build
```

- **Backend:** Available on port `9090`
- **Frontend:** Available on port `3000`

---

## 4. Production Health & Verification Checklist

- [ ] **Liveness Probe:** Visit `https://your-backend.onrender.com/health` &rarr; Returns HTTP 200 with `{"status":"healthy","database":"connected"}`.
- [ ] **Catalog Browsing:** Open frontend homepage &rarr; Movies and venues in Mumbai/Delhi/Bengaluru load without requiring login.
- [ ] **Location Switcher:** Click city button &rarr; Select another city &rarr; Screenings dynamically update.
- [ ] **Concurrency Check:** Run `pnpm run test:concurrency` against the deployed API &rarr; Guaranteed 0 duplicate seat bookings.
- [ ] **Public M-Ticket Sharing:** Book a ticket, copy the link (`/tickets/view/BMS-...`), and open it in an Incognito window &rarr; Pass loads frictionlessly without authentication.
