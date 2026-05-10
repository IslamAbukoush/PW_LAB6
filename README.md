# Dental Clinic Appointment Manager

Next.js + TypeScript application for Laboratory Work 7, extending the Lab 6 dental clinic appointment dashboard with an authenticated REST back-end API.

## Topic

Dental Clinic Appointment Manager

## Description

The application is a reception desk workspace for a dental clinic. It keeps an appointment board with patient name, dentist, service, date, time, status, notes, and a priority marker. Reception staff can create new appointments, remove outdated ones, update the visit status, mark important patients, search the schedule, and filter the visible queue.

Lab 7 adds a back-end API for the same appointment entity. The client now requests a short-lived JWT from `/token`, sends it as a Bearer token to the API, and uses the protected endpoints for create, read, update, and delete operations.

## Main Flows

1. Request API access
   - Select `ADMIN`, `WRITER`, or `VISITOR` in the dashboard.
   - The app calls `/token` and receives a JWT that expires in 60 seconds.
   - The token stores the selected role and permissions.

2. Add an appointment
   - Fill in patient name, dentist, service, date, time, status, and optional notes.
   - Submit the form.
   - The client sends `POST /api/appointments` with the JWT.

3. Manage an appointment
   - Change status or priority with `PUT /api/appointments/{id}`.
   - Delete an appointment with `DELETE /api/appointments/{id}`.
   - Buttons are disabled when the current token does not include the required permission.

4. Find appointments
   - The API supports `limit`, `offset`, `query`, `status`, `dentist`, `priorityOnly`, and `sort`.
   - The client loads records from the API and keeps search/filter/sort UI state in runtime.

5. Open documentation
   - Visit `/docs` for Swagger UI.
   - Visit `/api/openapi` for the OpenAPI JSON document.

## API Endpoints

- `GET /token?role=ADMIN`
- `POST /token`
- `GET /api/appointments?limit=25&offset=0`
- `POST /api/appointments`
- `GET /api/appointments/{id}`
- `PUT /api/appointments/{id}`
- `DELETE /api/appointments/{id}`

## Roles And Permissions

- `ADMIN`: `READ`, `WRITE`, `DELETE`
- `WRITER`: `READ`, `WRITE`
- `VISITOR`: `READ`

All appointment endpoints require `Authorization: Bearer <token>`. The token expires after 60 seconds for demo purposes.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

Then open:

- App: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/api/openapi`

Run verification:

```bash
npm run typecheck
npm run build
```

## Deployment Note

Lab 6 was static-export ready. Lab 7 adds dynamic route handlers, so deployment now needs a Node-compatible Next.js host such as Vercel, Render, Railway, or a VPS. GitHub Pages alone is no longer enough for the back-end routes.
