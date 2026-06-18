# AI Internship Matcher

AI Internship Matcher is a full-stack web platform that connects students and companies for internship opportunities using an intelligent skill-based matching system.

Students can build a CV-style profile, add education and experience, upload a PDF CV, receive internship recommendations, apply to offers, and track their applications. Companies can publish internship offers, review applicants, open student CVs, and accept or reject candidates. Administrators can supervise users and offers across the platform.

This project is designed as an engineering portfolio application that demonstrates full-stack development, REST API architecture, role-based access control, and an AI-assisted recommendation workflow.

## Badges

![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=111827)
![Laravel](https://img.shields.io/badge/Laravel-Backend-FF2D20?logo=laravel&logoColor=white)
![Python](https://img.shields.io/badge/Python-AI_Service-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Matching_API-009688?logo=fastapi&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)

## ✨ Features

### Student

- Register and log in securely
- Create a CV-style student profile
- Add education, skills, experience, and internship preferences
- Upload a CV file in PDF format
- Browse available internship offers
- Receive AI-based internship recommendations
- Apply to internship offers
- Track application status: pending, accepted, or rejected

### Company

- Access a dedicated company dashboard
- Create internship offers
- Edit and delete published offers
- View applicants for each offer
- Open and review student CVs
- Accept or reject candidates

### Admin

- View dashboard statistics
- Manage platform users
- Ban, unban, or delete users
- Manage and remove internship offers
- Supervise platform activity

## 🧠 AI Matching System

The AI matching system compares the skills listed in a student's profile with the skills required by each internship offer. For every offer, the system identifies the matching skills and calculates a compatibility score.

The matching score is computed using the following formula:

```text
Match Score = (Matched Skills / Required Skills) × 100
```

Example:

```text
Student skills:   Python, SQL, React
Required skills:  Python, FastAPI, SQL
Matched skills:   Python, SQL

Match Score = (2 / 3) × 100 = 66.67%
```

The result is used to rank internship offers and display the most relevant opportunities to each student.

## 🏗️ Project Architecture

```text
React Frontend
      |
      | REST API
      |
Laravel Backend
      |
--------------------------
|                        |
MySQL Database           FastAPI AI Service
```

### Repository Structure

```text
AiMatchingPlatform/
+-- app/                  # Laravel models, controllers, requests, services
+-- ai-service/           # Python FastAPI matching microservice
+-- database/             # Migrations, factories, and seeders
+-- frontend/             # React + Vite frontend application
+-- routes/               # Laravel API routes
+-- storage/              # Logs and uploaded files
+-- README.md
```

## Technology Stack

### Frontend

- React
- React Router
- Axios
- Vite
- Modern responsive UI

### Backend

- Laravel
- REST API
- Authentication system
- Role management for students, companies, and admins

### AI Service

- Python
- FastAPI
- Skill matching algorithm
- Optional CV skill extraction support

### Database

- MySQL

## ⚙️ Installation Guide

### Prerequisites

Make sure the following tools are installed:

- PHP and Composer
- Node.js and npm
- Python and pip
- MySQL

### Backend Setup

From the project root:

```bash
composer install
```

Create and configure your `.env` file. If `.env.example` exists, copy it first:

```bash
cp .env.example .env
```

If it does not exist, create `.env` manually using the environment configuration shown below.

Generate the application key:

```bash
php artisan key:generate
```

Run database migrations:

```bash
php artisan migrate
```

Optionally seed the database:

```bash
php artisan db:seed
```

Start the Laravel API:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

The API will run at:

```text
http://127.0.0.1:8000/api
```

### Frontend Setup

Move into the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

The frontend will run at:

```text
http://127.0.0.1:5173
```

### AI Service Setup

Move into the AI service directory:

```bash
cd ai-service
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate the virtual environment:

```bash
# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Run the FastAPI server:

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

The AI service documentation will be available at:

```text
http://127.0.0.1:8001/docs
```

## Environment Configuration

Configure the Laravel `.env` file with your local database and service settings:

```env
APP_NAME="AI Internship Matcher"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ai_internship_matcher
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URLS=http://localhost:5173,http://127.0.0.1:5173

AI_MATCHER_URL=http://127.0.0.1:8001
AI_MATCHER_TIMEOUT=8
AI_MATCHER_ENABLE_CV_EXTRACTION=true
```

If the frontend uses a separate environment file, set the API base URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Database Structure Overview

The database is organized around users, profiles, offers, applications, and skills.

### Main Tables

- `users`: Stores authentication data and the user role, such as student, company, or admin.
- `students`: Stores student profile details such as phone, city, university, degree, experience, preferences, and CV path.
- `companies`: Stores company profile information such as company name and description.
- `internship_offers`: Stores internship postings created by companies, including title, description, location, type, and required skills.
- `applications`: Stores internship applications submitted by students and their status.
- `skills`: Stores skill data linked to student profiles and used by the matching system.

## API Overview

### Authentication

- `POST /api/register`
- `POST /api/login`
- `GET /api/me`
- `POST /api/logout`

### Student

- `GET /api/profile`
- `POST /api/profile`
- `GET /api/recommendations`
- `POST /api/apply`
- `GET /api/applications`

### Company

- `GET /api/company/profile`
- `POST /api/company/profile`
- `GET /api/company/offers`
- `POST /api/company/offers`
- `PUT /api/company/offers/{offer}`
- `DELETE /api/company/offers/{offer}`
- `GET /api/company/applicants/{offer}`
- `PATCH /api/company/applicants/{offer}/{application}`

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PATCH /api/admin/users/{user}`
- `DELETE /api/admin/users/{user}`
- `GET /api/admin/offers`
- `DELETE /api/admin/offers/{offer}`

## Future Improvements

- Machine learning recommendation model
- NLP-based CV analysis
- Real-time notifications
- Advanced search and filtering
- Messaging between students and companies
- Email notifications for application updates
- Analytics dashboard for companies

## Authors

Developed by:

- SEBBAHI EL MEHDI

This project was built as a full-stack engineering portfolio project to demonstrate web development, API design, role-based workflows, and AI-assisted matching.
