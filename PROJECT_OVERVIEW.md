# 🔐 DocSafe India - Project Overview & Documentation

## 📑 Project Topic & Objective
**DocSafe India** is a comprehensive, full-stack Secure Document Management System designed specifically for securely storing, managing, and sharing sensitive government documents (such as Aadhaar, PAN, Passport, Voter ID) with family members. 

The core topic and primary objective of this project is to solve the problem of fragmented and insecure physical/digital document storage. It provides individuals and families with a centralized, highly secure SaaS platform to maintain access to critical documents anytime, anywhere, with fine-grained sharing permissions.

---

## 🚀 Comprehensive Feature List

The project includes a wide array of robust features designed for security, usability, and family integration:

### 1. 🔐 Security & Authentication
- **Secure Onboarding:** JWT-based robust authentication system.
- **Two-Factor/OTP Verification:** Email-based OTP verification using Resend API to ensure valid user identities.
- **Role-Based Access Control (RBAC):** Strict access control ensuring users only see their own files or files explicitly shared with them.
- **End-to-End Auditing:** Comprehensive tracking to monitor exactly who viewed or downloaded which document.

### 2. 📄 Advanced Document Management
- **Cloud Storage Integration:** Real-time, secure file uploads utilizing Cloudinary.
- **CRUD Operations:** Seamless ability to Upload, View, Update, and Delete government IDs and sensitive documents.
- **Validation:** Strict file type validation (PDF, JPG, PNG) and file size constraints (max 10MB) for optimal storage and security.

### 3. 🤝 Family & Sharing Ecosystem
- **Family Member Management:** Seamlessly add, manage, and remove family members from a user's ecosystem via email integration.
- **Granular Sharing Permissions:** Share specific documents with specific family members while maintaining strict access rights (e.g., "View Only" vs. "View & Download").
- **Revokable Access:** Users can instantly revoke shared access to any document at any time.

### 4. 📊 Activity Logs & Monitoring
- **Real-Time Activity Dashboard:** Complete historic logs of every system activity (e.g., "Document Uploaded", "Document Shared", "Failed Login Attempt").
- **Dashboard Statistics:** Visual metrics and statistics regarding the total number of documents and overall account usage.

### 5. 💻 Modern & Responsive UI/UX
- **SaaS Interface:** A clean, modern SaaS-style dashboard utilizing a dynamic Dark Mode layout.
- **Mobile Responsive:** Completely responsive design ensuring optimal usage on desktops, tablets, and smartphones.

---

## 🛠️ Technology Stack

This project is built using the robust **MERN** stack:

* **Frontend:** React.js, Vite, Vanilla CSS 
* **Backend:** Node.js, Express.js
* **Database:** MongoDB coupled with Mongoose for Object Data Modeling
* **Authentication/Security:** JSON Web Tokens (JWT), bcrypt (password hashing), Helmet.js
* **Third-Party Integrations:** Cloudinary (File Storage), Resend API (Email/OTP delivery)

---

## 🎯 Target Audience & Use Cases
- **Heads of Family:** Keeping track of children's and spouses' medical and government documents in one secure place.
- **Remote Access:** Providing elderly parents an easy way to access their critical documents securely from anywhere without carrying physical copies.
- **Emergency Preparedness:** Having a single, secure cloud vault for all critical identification documents if physical wallets or files are lost.
