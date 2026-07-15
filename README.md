# 📦 Full-Stack Inventory Management System (IMS)

![.NET 10](https://img.shields.io/badge/.NET_10-512BD4?logo=dotnet&logoColor=white&style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB&style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white&style=for-the-badge)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white&style=for-the-badge)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?logo=microsoft-sql-server&logoColor=white&style=for-the-badge)

> A high-performance, secure, and visually interactive inventory and sales tracking system developed as part of the Digital Egypt Pioneers Initiative (DEPI). Designed to streamline warehouse operations, supplier management, and stock history.

---
## ✨ Features
* **Cinematic 3D UI:** A highly interactive frontend utilizing Framer Motion and CSS 3D transforms for seamless, engaging user experiences (including a custom 3D crate intro sequence).
* **Robust Clean Architecture:** Backend built on `.NET 10`, separating API, Core, Domain, Infrastructure, and Service layers for ultimate scalability and maintainability.
* **Stateless Security:** Fully secured API using JWT (JSON Web Tokens) Bearer authentication via headers, eliminating CORS/CSRF vulnerabilities associated with traditional cookie-based sessions.
* **Modern Data Flow:** Implements CQRS (Command Query Responsibility Segregation) using MediatR, coupled with FluentValidation and AutoMapper.
* **Comprehensive Tracking:** Real-time stock history monitoring, product categorization, and supplier linking.

---

## 🛠️ Tech Stack

### Frontend (Client)
* **Framework:** React.js + Vite
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion
* **Networking:** Axios (with custom interceptors for seamless JWT injection)

### Backend (Server)
* **Framework:** C# / .NET 10 Web API
* **ORM:** Entity Framework Core
* **Database:** SQL Server
* **Architecture Patterns:** MediatR (CQRS), AutoMapper, FluentValidation

---
## 🚀 Getting Started

### Prerequisites
- [Node.js (LTS)](https://nodejs.org/)
- [.NET 10 SDK](https://dotnet.microsoft.com/)
- SQL Server

### 1. Backend Setup (Port 5280)
Navigate to the API directory, apply the database migrations, and start the server:
` ` `bash
cd server/Inventory-System/Inventory-System.API
dotnet ef database update
dotnet run
` ` `

### 2. Frontend Setup (Port 5173)
Navigate to the React client, install dependencies, and start the development server:
` ` `bash
cd client/IMS-Front
npm install
# Ensure your .env file contains: VITE_API_URL=http://localhost:5280/api
npm run dev
` ` `

## 👨‍💻 Development Team
- **Khaled Maher**
- **Osama Reda**
- **Youssef Sayed**
- **Nour Essam**
- **Ezzat Karem**
- **Abdelrahman Ahmed**
