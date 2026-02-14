🐾 AI-Based Pet Health Diagnosis Platform

A microservice-based AI-powered pet health analysis system built with ASP.NET Core, React Native (Expo), and Python (FastAPI).

📌 Project Overview

AI-Based Pet Health Diagnosis Platform is a full-stack, microservice-oriented mobile application that allows pet owners to analyze their pets' health conditions using artificial intelligence.

The system performs:

🐶🐱 Species detection (Cat / Dog)

🩺 Skin disease classification using deep learning models

📊 Risk scoring and analysis reporting

📍 Nearby veterinarian suggestions (Google Places API)

📂 AI analysis history tracking

🛒 Integrated e-commerce structure (Cart / Orders / Address system)

The platform is designed with scalability, modularity, and production-level architecture principles.

🏗️ System Architecture

The project follows a 3-layer microservice architecture:

Mobile App (React Native - Expo)
            ↓
ASP.NET Core Web API (Backend)
            ↓
Python FastAPI AI Service

🔹 Frontend

React Native (Expo)

TypeScript

Context API

Axios

Secure JWT Authentication

🔹 Backend

ASP.NET Core Web API (.NET 8)

Entity Framework Core

SQL Server

JWT Authentication

Role-based authorization

RESTful API design

🔹 AI Service

FastAPI

PyTorch / TensorFlow models

Custom trained CNN models

Image preprocessing & inference pipeline

🧠 AI Capabilities

The AI service includes:

Image classification models

Skin disease detection for cats & dogs

Real-time inference support

Scalable REST API communication

Timeout & upload control mechanisms

🔐 Security Features

JWT-based authentication

Secure configuration management

Environment variable secret storage

API key restriction (Google Places API)

Upload size limitations

Structured logging system

🗄️ Database Design

SQL Server relational database

Normalized schema

Entities:

Users

Pets

AIAnalysisHistory

Addresses

Orders

Cart

Tokens

🌍 External Integrations

Google Places API (Veterinarian location service)

JWT token authentication

Image upload handling

📦 Repository Structure
ai-pet-health-app/
│
├── Hurma.API/              → ASP.NET Core Backend
├── hurma-frontend/         → React Native Mobile App
├── hurma-ai-new/           → Python AI Service
├── README.md
└── .gitignore

🚀 Installation Guide
1️⃣ Backend (ASP.NET Core)
cd Hurma.API
dotnet restore
dotnet run


Make sure SQL Server is running.

2️⃣ AI Service (FastAPI)
cd hurma-ai-new
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000

3️⃣ Frontend (Expo)
cd hurma-frontend
npm install
npx expo start

🛠️ Tech Stack
Layer	Technology
Mobile	React Native (Expo)
Backend	ASP.NET Core (.NET 8)
Database	SQL Server
AI	FastAPI, PyTorch
Auth	JWT
ORM	Entity Framework Core
API Style	RESTful
📊 Production-Ready Principles

Clean Architecture principles

Separation of concerns

Microservice communication

Secure key handling

Modular design

Scalable backend structure

📈 Future Improvements

Docker containerization

Kubernetes deployment

CI/CD pipeline

Model retraining automation

Cloud deployment (Azure / GCP)

Role-based dashboard for veterinarians

👩‍💻 Developer

Bahar Aykut
Computer Engineering Student
AI & Full-Stack Software Developer

📍 Türkiye
🔗 GitHub: https://github.com/baharaykut

🔗 LinkedIn: (LinkedIn linkini ekleyebilirsin)

🔎 Areas of Expertise

Artificial Intelligence & Deep Learning

ASP.NET Core Web API

React Native (Expo)

Microservice Architecture

RESTful API Design

SQL Server & EF Core

Secure Authentication (JWT)

🧩 Engineering Philosophy

This project reflects:

Clean and maintainable code practices

Separation of concerns

Scalable backend architecture

AI integration with real-world application

Secure secret management

Production-oriented system design

📜 License

This project is developed for:

Academic research

Portfolio demonstration

Learning and experimentation purposes

All rights reserved © 2026 Bahar Aykut.

Unauthorized commercial usage is not permitted without permission.

⭐ Why This Project Stands Out

✔️ AI + Backend + Mobile in one ecosystem
✔️ Real microservice communication
✔️ Production-ready architecture mindset
✔️ Secure configuration management
✔️ Expandable & scalable design