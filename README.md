# AI Internship Matcher

AI Internship Matcher is a full-stack MVP that connects students and companies for internship discovery and hiring. The backend is a Laravel REST API, the frontend is a standalone React app in `frontend/`, and the AI matching microservice lives in `ai-service/`.

## Architecture

```text
AiMatchingPlatform/
├── ai-service/               # FastAPI matching microservice
│   ├── app/
│   │   ├── main.py
│   │   └── skills.py
│   └── requirements.txt
├── app/                      # Laravel API domain logic
├── config/
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
├── routes/
│   ├── api.php
│   └── web.php
└── README.md
```

## Features

- Student registration and login with Sanctum token auth
- Company registration and login with company profile creation
- Admin dashboard with moderation and offer management
- Student profile editing with skill tags and CV upload
- Internship posting, editing, deletion, and applicant review for companies
- Skill-based internship recommendations via the Python AI service
- Application tracking with `pending`, `accepted`, and `rejected` states
- Match score persistence in `match_scores`

## Backend Setup

1. Install PHP dependencies if needed:

```bash
php composer.phar install
```

2. Copy the backend environment file and update it for your database:

```bash
copy .env.example .env
```

The checked-in `.env` in this workspace still uses SQLite so the project can be validated quickly here. For the intended MySQL setup, use the values in `.env.example`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ai_internship_matcher
DB_USERNAME=root
DB_PASSWORD=
```

3. Generate an app key and migrate:

```bash
php artisan key:generate
php artisan migrate --seed
```

4. Start the Laravel API:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

## Frontend Setup

1. Move into the React app:

```bash
cd frontend
```

2. Copy the frontend environment file:

```bash
copy .env.example .env
```

3. Install dependencies and start Vite:

```bash
npm install
npm run dev
```

The frontend expects the Laravel API at `http://127.0.0.1:8000/api` by default.

## AI Service Setup

1. Move into the AI service:

```bash
cd ai-service
```

2. Create and activate a Python virtual environment, then install requirements:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

3. Start the FastAPI server:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

## Default Admin Account

The database seeder creates a single admin account:

- Email: `admin@aimatcher.test`
- Password: `password`

## Core API Routes

### Auth

- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`

### Student

- `GET /api/profile`
- `POST /api/profile`
- `POST /api/apply`
- `GET /api/applications`
- `GET /api/recommendations`

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

## API Examples

### Register a student

```http
POST /api/register
Content-Type: application/json

{
  "name": "Amina Student",
  "email": "amina@example.com",
  "password": "password",
  "password_confirmation": "password",
  "role": "student",
  "skills": ["python", "sql", "react"]
}
```

### Create an internship offer

```http
POST /api/company/offers
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "AI Engineering Intern",
  "description": "Work on recommendation features and model-backed services.",
  "required_skills": ["python", "fastapi", "sql", "machine learning"]
}
```

### Match a student to a single offer

```http
POST http://127.0.0.1:8001/match
Content-Type: application/json

{
  "student_skills": ["python", "sql", "react"],
  "offer_skills": ["python", "fastapi", "sql"]
}
```

### Rank internships for a student

```http
POST http://127.0.0.1:8001/rank
Content-Type: application/json

{
  "student_skills": ["python", "sql", "react"],
  "internships": [
    {
      "offer_id": 1,
      "title": "Backend Intern",
      "required_skills": ["php", "laravel", "mysql"]
    },
    {
      "offer_id": 2,
      "title": "AI Intern",
      "required_skills": ["python", "sql", "machine learning"]
    }
  ]
}
```

## Notes

- The Laravel API uses Sanctum personal access tokens for the React frontend.
- The backend falls back to a local deterministic skill matcher if the Python service is unavailable.
- CV uploads are stored under the public storage disk and can optionally be parsed by the FastAPI service using PyMuPDF.
- The current workspace validates quickly with SQLite, but the provided example configuration is MySQL-first for the target stack.
