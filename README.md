# 🌸 Kaira Webinar Hub

**Kaira Webinar Hub** is a full-stack webinar and masterclass platform with a **Burgundy & Rose Pink** visual design system.

---

## 🎨 Color System & Design Tokens

- **Primary Burgundy:** `#970747` (Navigation bar, primary buttons, headings, accents)
- **Secondary Rose Pink:** `#D63384` (Highlights, icons, badges, borders)
- **Soft Rose:** `#F3A6C4` (Card borders, subheadings, soft rings)
- **Blush Background:** `#F7DCE8` (Decorative backgrounds, pill tags, badges)
- **Main Background:** `#FFFFFF` (Primary white canvas)
- **Soft Section Background:** `#FDF5F8` (Alternating section containers)
- **Main Text:** `#25171E` (High contrast typography)
- **Secondary Text:** `#66545D` (Descriptive paragraphs)
- **Borders:** `#EBDDE4` (Clean card dividers)
- **Primary Button Gradient:** `linear-gradient(110deg, #970747 0%, #D63384 100%)`

---

## 🏗️ Architecture

```
Kaira_Webinar_hub/
├── frontend/             # React 19 + Vite + Tailwind CSS + Three.js client
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Sticky burgundy header (#970747)
│   │   │   ├── HeroThree.jsx            # Interactive 3D Three.js sphere & particles
│   │   │   ├── UpcomingWebinars.jsx     # Category filters & event cards
│   │   │   ├── PromotionalVideoSection.jsx # Video player & learning outcomes
│   │   │   ├── BenefitsSection.jsx      # Core value props
│   │   │   ├── SpeakersSection.jsx      # Verified practitioner bios
│   │   │   ├── HowItWorks.jsx           # 4-step workflow
│   │   │   ├── ContactSection.jsx       # Enquiry form & FAQ accordion
│   │   │   ├── RegistrationModal.jsx    # Tier selection & Razorpay checkout
│   │   │   ├── SuccessReceiptModal.jsx  # QR code pass & confirmation
│   │   │   ├── WebinarDetailsModal.jsx  # Full curriculum details
│   │   │   ├── AdminDashboard.jsx       # Operational metrics, roster & CSV export
│   │   │   ├── AuthModal.jsx            # Pass lookup & admin access
│   │   │   └── Footer.jsx               # Burgundy footer with policy links
│   │   ├── index.css                    # Tailwind design system & CSS variables
│   │   └── App.jsx                      # Main application coordinator
│   └── package.json
│
└── backend/              # Node.js + Express + MongoDB API Server
    ├── config/db.js                     # MongoDB connection with memory fallback
    ├── models/                          # Mongoose schemas (Webinar, Registration)
    ├── controllers/                     # Business logic (Webinar, Registration, Admin)
    ├── routes/                          # API endpoints (/api/webinars, /api/registration, /api/admin)
    ├── services/storage.js              # Resilient dual storage (MongoDB + In-Memory)
    ├── server.js                        # Express server entry point
    └── package.json
```

---

## ⚡ Quick Start

### 1. Run Backend Server (Port 5001)

```bash
cd backend
npm install
npm start
```
*Health check:* `http://localhost:5001/api/health`

### 2. Run Frontend Client (Port 5174)

```bash
cd frontend
npm install
npm run dev
```
*Client URL:* `http://localhost:5174`

---

## 🛡️ Key Features & Integrations

1. **Interactive Three.js Hero Visual:** A floating 3D sphere with physical materials, orbital rings, floating petals, and pointer responsiveness.
2. **Backend-Driven Payment Verification:** Registration and passes are only confirmed after cryptographic/database verification on the backend.
3. **Digital QR Code Entry Pass:** Instant digital pass with entry QR code, Google Calendar invite link, and printable tax invoice.
4. **Email & WhatsApp Notifications:** Integrated confirmation dispatch and scheduled template reminders.
5. **Administrator Dashboard:** Real-time revenue metrics, attendee roster with CSV export, webinar creator, and notification template manager.
