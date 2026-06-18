# Student CV Onboarding API

## Register a student profile

Use `multipart/form-data` when uploading a CV during registration.

```http
POST /api/register
Accept: application/json
Content-Type: multipart/form-data
```

```json
{
  "name": "Sara El Amrani",
  "email": "sara@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "student",
  "phone": "+212600000000",
  "city": "Casablanca",
  "university": "Hassan II University",
  "degree": "Bachelor",
  "field_of_study": "Computer Science",
  "skills": ["javascript", "python", "react"],
  "experience_title": "Frontend Intern",
  "experience_description": "Built reusable React components for a student portal.",
  "preferred_technologies": ["react", "laravel", "ai"],
  "internship_type": "Hybrid",
  "preferred_location": "Casablanca",
  "cv": "resume.pdf"
}
```

## Update student profile

```http
POST /api/student/profile
Authorization: Bearer {token}
Accept: application/json
```

```json
{
  "name": "Sara El Amrani",
  "phone": "+212600000000",
  "city": "Rabat",
  "university": "Hassan II University",
  "degree": "Bachelor",
  "field_of_study": "Software Engineering",
  "experience_title": "React Project Lead",
  "experience_description": "Led a team project using React, Laravel, and MySQL.",
  "preferred_technologies": ["react", "python", "mysql"],
  "internship_type": "Remote",
  "preferred_location": "Remote"
}
```

## Replace student skills

```http
POST /api/student/skills
Authorization: Bearer {token}
Accept: application/json
```

```json
{
  "skills": ["javascript", "python", "react", "laravel"]
}
```

## Upload CV

```http
POST /api/student/upload-cv
Authorization: Bearer {token}
Accept: application/json
Content-Type: multipart/form-data
```

```json
{
  "cv": "resume.pdf"
}
```
