# 🔐 DocSafe India

> **Secure & Share Government Documents with Family**  
> A full-stack MERN application for securely storing and sharing government documents

---

## 🚀 Features

- 🔐 **JWT Authentication** with OTP Email Verification
- 📄 **Document Management** — Upload, view, update, delete (Aadhaar, PAN, Passport, etc.)
- 🤝 **Family Sharing** — Share documents with permission control (View / Download)
- 👨‍👩‍👧 **Family Member Management** — Add/remove family members by email
- 📊 **Activity Logs** — Track every system activity
- 🌐 **Cloud Storage** — Documents securely stored on Cloudinary
- 🛡️ **Role-Based Access** — User & Admin roles
- 📱 **Responsive Design** — Mobile-friendly SaaS dashboard

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Authentication | JWT + Resend (OTP) |
| File Storage | Cloudinary |
| Styling | Vanilla CSS (dark mode SaaS) |

---

## 📁 Project Structure

```
Government Project/
├── backend/                   # Express API server
│   ├── controllers/           # Route handlers
│   │   ├── authController.js  # Login, Register, OTP
│   │   ├── documentController.js
│   │   ├── shareController.js
│   │   ├── userController.js
│   │   └── activityController.js
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   ├── Document.js
│   │   ├── Share.js
│   │   └── ActivityLog.js
│   ├── routes/                # API routes
│   ├── middleware/            # Auth + Cloudinary + Multer
│   ├── utils/                 # OTP, JWT, Logger
│   ├── server.js              # Main server entry
│   └── .env                   # Environment variables
│
└── frontend/                  # React app
    ├── src/
    │   ├── pages/             # All pages
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── VerifyOtp.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── MyDocuments.jsx
    │   │   ├── SharedDocuments.jsx
    │   │   ├── FamilyMembers.jsx
    │   │   ├── ActivityLogs.jsx
    │   │   ├── Profile.jsx
    │   │   └── Settings.jsx
    │   ├── components/        # Reusable components
    │   │   ├── DashboardLayout.jsx
    │   │   ├── UploadModal.jsx
    │   │   └── ShareModal.jsx
    │   ├── services/api.js    # Axios API service
    │   ├── context/AuthContext.jsx
    │   └── index.css          # All styles
    └── .env
```

---

## ⚙️ Setup Instructions

### 1. Backend Setup

```bash
# Install dependencies (in root directory)
npm install

# Configure backend/.env with your credentials:
# - MONGO_URI (MongoDB Atlas connection string)
# - JWT_SECRET (random secret string)
# - RESEND_API_KEY (Resend API key)
# - EMAIL_FROM (Verify your domain in Resend)
# - CLOUDINARY_* (Cloudinary account details)

# Start backend from root
npm run dev:backend
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

### `backend/.env`
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
RESEND_API_KEY=re_...
EMAIL_FROM=no-reply@yourdomain.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=http://localhost:5175
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/resend-otp` | Resend OTP |
| GET | `/api/auth/me` | Get current user |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload document |
| GET | `/api/documents` | Get my documents |
| GET | `/api/documents/stats` | Dashboard stats |
| DELETE | `/api/documents/:id` | Delete document |

### Shares
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shares` | Share document |
| GET | `/api/shares/received` | Shared with me |
| GET | `/api/shares/sent` | Shared by me |
| DELETE | `/api/shares/:id` | Revoke share |

### Users & Activity
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/family` | Add family member |
| GET | `/api/activity` | Activity logs |

---

## 🔒 Security Features

- ✅ JWT tokens with 7-day expiry
- ✅ OTP verification (10-minute window)
- ✅ File type validation (PDF, JPG, PNG only)
- ✅ File size limit (10MB per document)
- ✅ Rate limiting (100 req/15 min)
- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Users can only access their own documents
---

## 🌐 Deployment

### Backend → [Render](https://render.com/)
- Set all env variables in Render dashboard
- Build command: `npm install`
- Start command: `node backend/server.js`

### Frontend → [Vercel](https://vercel.com/)
- Set `VITE_API_URL` to your Render backend URL
- Build command: `npm run build`
- Root: `frontend/`

---

## 👨‍💻 Author

**Aftab Alam** 
