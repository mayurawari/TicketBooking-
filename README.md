# TicketPass — Full-Stack Cinema Ticket Booking Platform

A modern, high-performance cinema and multiplex ticket booking application built with **Next.js 16 (App Router)** and **Express.js 5 + Prisma ORM (Neon PostgreSQL)**.

---

## 🚀 Key Features

- **Authentication & Roles:** JWT session-based auth with HTTP-only cookies and Bearer token fallback. Distinct roles: `USER` and `ADMIN`.
- **Movie & Venue Discovery:** Browse upcoming events, filter by city or title, and view multiplex cinema specs.
- **Interactive Seat Map:** Real-time visual theatre seating layout with tiered pricing:
  - 🟣 **Luxury (₹500)**
  - 🔵 **Platinum (₹350)**
  - 🟡 **Gold (₹250)**
  - ⚪ **Silver (₹180)**
  - 🟢 **Front Row (₹120)**
- **Conflict Prevention:** Concurrency checks (`409 Conflict`) prevent double-booking of seats.
- **Customer Ticket Passes:** Live `/my-bookings` dashboard displaying upcoming tickets with self-service cancellation.
- **Admin Control Center:** Dedicated `/admin` portal to create/delete venues, list events, and monitor global ticket sales.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (Turbopack), React 19, Tailwind CSS v4, Lucide React, TypeScript
- **Backend:** Node.js (ESM), Express.js 5, Prisma 7, Neon Serverless PostgreSQL
- **Security:** Bcrypt password hashing, JWT access/refresh token rotation, CORS whitelist

---

## 🏁 Getting Started

### 1. Start the Backend API

```bash
cd backend
pnpm install
node index.js
```

Backend will run at `http://localhost:3000` (or `PORT=9090`).

### 2. Start the Frontend App

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend will run at `http://localhost:3000` (or Next.js port). Set `NEXT_PUBLIC_API_URL=http://localhost:3000` in `frontend/.env.local` if backend runs on a different port.

---

## 🔑 Pre-Seeded Test Credentials

| Role | Email | Password |
|---|---|---|
| **Regular User** | `mayurawari50@gmail.com` | `123456` |
| **Admin User** | `admin@ticketbooking.com` | `Admin@123` |

*Convenient 1-click quick-fill buttons are also available directly on the `/login` screen.*
