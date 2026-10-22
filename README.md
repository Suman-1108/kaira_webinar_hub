# 🎓 Kaira Webinar Hub - Digital Learning & Webinar Marketplace

**Kaira Webinar Hub** is a production-grade webinar marketplace inspired by Udemy's course discovery, searchable catalog, detail pages, user dashboards, and instructor tools, wrapped in Kaira's distinctive identity.

---

## 🎨 Design System & Visual Identity

The design system incorporates a clean, marketplace-oriented palette:

- **Primary Purple:** `#A435F0` (Primary CTA buttons, active state, highlights)
- **Primary Hover:** `#8710D8`
- **Dark Text:** `#1C1D1F` (Charcoal headlines and high-contrast typography)
- **Secondary Text:** `#52525B` (Subtitles, ratings counts, metadata)
- **Main Canvas:** `#FFFFFF`
- **Section Background:** `#F7F9FA` (Soft alternating panels)
- **Borders:** `#D1D1D7` (Subtle dividers and card outlines)
- **Information Panel:** `#E6F2F5`
- **Badges:** Bestseller Gold `#ECEB98`, Free Pass `#DCFCE7`, Featured `#F3E8FF`
- **Status Tokens:** Success `#15803D`, Warning `#B45309`, Error `#B91C1C`

---

## 🚀 Key Functional Modules

1. **Marketplace Discovery & Catalog**:
   - Debounced search across titles, topics, and speakers.
   - Filtering by category (Artificial Intelligence, Web Development, Cloud & DevOps, Business & Marketing).
   - Filtering by Free Passes vs. VIP/Paid Passes.
   - Sorting by Upcoming, Highest Rated, and Price.

2. **Udemy-Style Webinar Detail Page**:
   - Dark header banner with breadcrumbs, ratings, learners count, and instructor link.
   - Desktop floating sticky purchase card with video/image preview, price discount badge, and guarantees.
   - "What you'll learn" checklist card.
   - Curriculum / agenda accordion breakdown.
   - Instructor bio with ratings, reviews, and student statistics.
   - Attendee reviews with 5-star ratings.
   - Related webinars ("Students also registered for").

3. **Authentication & User Accounts**:
   - JWT authentication (`/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/me`).
   - Secure bcryptjs password hashing.
   - Demo student (`pooja.sundaram@techvision.io` / `student123`) & Demo admin (`admin@kairawebinarhub.com` / `admin123`) fast-fill buttons.
   - Password reset flow with cryptographic tokens.

4. **Participant Dashboard (`/my-events`, `/my-invoices`, `/my-account`)**:
   - Active pass roster with direct "Join Live" streaming links.
   - Verified pass QR code modal.
   - Invoices & receipts table with instant PDF/printable generation.
   - Notification preferences (Email notifications & daily learning updates).

5. **Payment Processing (PhonePe PG v2 Standard Checkout)**:
   - Official `@phonepe-pg/pg-sdk-node` SDK integration.
   - Server-side standard pay request generation with amount in paise.
   - Real-time status verification (`COMPLETED`/`SUCCESS`) via `getOrderStatus()`.
   - Webhook callback processor with idempotency and duplicate fulfillment protection.

6. **Transactional Messaging & Persistent Notification Scheduler**:
   - Automated Gmail SMTP / Nodemailer email delivery.
   - 6-digit registration OTP verification with SHA-256 hashing and 10-minute expiry.
   - Instant ticket delivery, automated 24h & 1h reminder jobs.
   - Automated PDF tax invoice attachments upon successful payment.

7. **Admin Management Console (`/admin`)**:
   - Real-time revenue and attendee telemetry.
   - Integration diagnostic cards (PhonePe PG v2, Gmail SMTP).
   - Webinar CRUD publisher.
   - Attendee database with one-click CSV export.

---

## 🏗️ Architecture

```
Kaira_Webinar_hub/
├── frontend/                     # React 19 + Vite + Tailwind CSS + React Router
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/WebinarCard.jsx        # Udemy-style course card with badges & stars
│   │   │   ├── layout/Navbar.jsx             # Top search bar, Explore categories, Auth
│   │   │   ├── layout/Footer.jsx             # Newsletter, policy links, trust badges
│   │   │   ├── RegistrationModal.jsx         # Pass tier selection & PhonePe PG v2 checkout
│   │   │   ├── SuccessReceiptModal.jsx       # Verified ticket pass with QR code
│   │   │   └── ...
│   │   ├── context/AuthContext.jsx           # Global user authentication session
│   │   ├── pages/
│   │   │   ├── HomePage.jsx                  # Hero, search, category tabs, featured grid
│   │   │   ├── WebinarsPage.jsx              # Full filterable catalog
│   │   │   ├── WebinarDetailPage.jsx         # Detail page with sticky buy card
│   │   │   ├── SpeakersPage.jsx              # Instructor directory
│   │   │   ├── ParticipantDashboard.jsx      # My Events, Invoices, Account settings
│   │   │   ├── AdminPage.jsx                 # Operations & governance console
│   │   │   ├── AuthPages.jsx                 # Login, Register, Forgot Password
│   │   │   └── StaticPages.jsx               # About, FAQ, Contact, Terms, Policies
│   │   ├── index.css                         # Design tokens & typography
│   │   └── App.jsx                           # React Router coordinator
│   └── package.json
│
└── backend/                      # Node.js + Express + MongoDB Atlas / Resilient Memory
    ├── config/db.js              # MongoDB Atlas connection
    ├── models/                   # User, Webinar, Registration, NotificationJob
    ├── controllers/              # Auth, Webinar, Registration, Admin
    ├── routes/                   # /api/v1/auth, /api/v1/webinars, /api/v1/registrations, /api/v1/admin
    ├── services/storage.js       # Dual storage abstraction (DB + In-Memory Fallback)
    ├── data/seedWebinars.js      # Rich sample masterclasses & reviews
    ├── server.js                 # API server entry point
    └── package.json
```

---

## ⚡ Quick Start

### 1. Start the Backend API Server
```bash
cd backend
npm install
npm run dev   # Runs on http://localhost:5001
```

### 2. Start the Frontend Client
```bash
cd frontend
npm install
npm run dev   # Runs on http://localhost:5173
```

### 3. Build for Production
```bash
cd frontend
npm run build
```

---

## 🔐 Credentials & Evaluation Accounts

- **Student Demo:** `pooja.sundaram@techvision.io` / `student123`
- **Admin Demo:** `admin@kairawebinarhub.com` / `admin123`
