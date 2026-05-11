# Lab 7 Presentation Guide

## What Was Implemented

This lab extends the Lab 6 dental clinic appointment dashboard with a REST back-end. The entity is `Appointment`, with these fields: `id`, `patient`, `dentist`, `service`, `date`, `time`, `status`, `notes`, and `favorite`.

The demo starts with 48 seeded appointments. This makes pagination, filtering, sorting, role permissions, and CRUD operations easier to show without manually creating many records during the presentation.

Implementation commits:

1. `0c8e51f Add appointment domain and JWT helpers`
   - Added the shared appointment types, seed data, validation, in-memory CRUD store, pagination/filter parsing, role mapping, JWT issuing, JWT verification, and permission checks.
2. `594f1b3 Add authenticated appointment REST API`
   - Added `/token`, `/api/appointments`, and `/api/appointments/{id}`.
   - Removed static export mode because the back-end requires dynamic route handlers.
3. `46a763d Add OpenAPI documentation`
   - Added `/api/openapi` and `/docs`.
   - `/docs` loads Swagger UI and points it at the generated OpenAPI document.
4. `b1491d1 Connect appointment dashboard to API`
   - Updated the front-end to request JWTs, send Bearer tokens, call the protected CRUD API, display token status, switch roles, reload API data, and disable actions not allowed by the current role.

## Requirements Checklist

- CRUD API for Lab 6 entity: implemented for appointments.
- API protected by JWT: all `/api/appointments` routes require `Authorization: Bearer <token>`.
- JWT stores role and permissions: token payload includes `role` and `permissions`.
- JWT expiration: tokens expire in 60 seconds.
- `/token` endpoint: supports `POST /token` and `GET /token?role=ADMIN`.
- Appropriate status codes: uses `200`, `201`, `204`, `400`, `401`, `403`, and `404`.
- Pagination: `GET /api/appointments` supports `limit` and `offset`, with maximum `limit=100`.
- Documentation: Swagger UI at `/docs`; OpenAPI JSON at `/api/openapi`.
- Client integration: dashboard creates, reads, updates, and deletes appointments through the API.
- Git history: implementation is split into separate commits.

## Theory To Know

REST:
REST models application data as resources. In this project, `/api/appointments` is the appointment collection and `/api/appointments/{id}` is one appointment resource. Standard HTTP methods express the operation: `GET` reads, `POST` creates, `PUT` updates, and `DELETE` removes.

JWT:
A JSON Web Token represents signed claims. This app signs tokens with HS256. The payload stores the user role, permissions, issued time, and expiration time. The API checks the signature, expiration, and required permission before executing a request.

Important demo-auth note:
The public `/token` endpoint is intentionally used for this laboratory work because the assignment requires a token endpoint where roles or permissions can be passed in. This is not a production login system. In a real clinic system, `/token` would verify a username/password, OAuth provider, or other identity provider before issuing a JWT.

Roles and permissions:
Roles are a convenient way to group permissions. `ADMIN` can read, write, and delete. `WRITER` can read and write. `VISITOR` can only read. The back-end still checks actual permissions, not only the role name.

Bearer authentication:
The front-end sends the token in the HTTP header:

```http
Authorization: Bearer <token>
```

If the token is missing or expired, the API returns `401`. If the token is valid but lacks the required permission, the API returns `403`.

Pagination:
Large collections should not be returned all at once. The API accepts `limit` for page size and `offset` for how many matching records to skip. The response includes `total`, `returned`, `nextOffset`, and `previousOffset`.

OpenAPI and Swagger:
OpenAPI is a machine-readable API description. Swagger UI reads it and creates an interactive documentation page where endpoints can be tested from the browser.

## How To Run The Demo

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open the dashboard:

```text
http://localhost:3000
```

4. Show JWT role behavior:
   - Select `ADMIN`.
   - Confirm the permission chips show `READ`, `WRITE`, and `DELETE`.
   - Add an appointment.
   - Change its status.
   - Mark it as priority.
   - Delete it.
   - Select `VISITOR`.
   - Show that write/delete controls are disabled.
   - Wait 60 seconds or use an old token in Swagger to show token expiration.

5. Open Swagger UI:

```text
http://localhost:3000/docs
```

6. In Swagger:
   - Run `POST /token` with `{ "role": "ADMIN" }`.
   - Copy the returned token.
   - Press `Authorize`.
   - Paste the token as the Bearer value.
   - Run `GET /api/appointments?limit=2&offset=0`.
   - Run `POST /api/appointments`.
   - Run `PUT /api/appointments/{id}`.
   - Run `DELETE /api/appointments/{id}`.

7. Show the commit history:

```bash
git log --oneline --decorate --max-count=8
```

## Manual API Test Commands

PowerShell example:

```powershell
$token = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/token" -ContentType "application/json" -Body '{"role":"ADMIN"}'
$headers = @{ Authorization = "Bearer $($token.token)" }

Invoke-RestMethod -Uri "http://localhost:3000/api/appointments?limit=2&offset=0" -Headers $headers

$created = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/appointments" -Headers $headers -ContentType "application/json" -Body '{"patient":"Demo Patient","dentist":"Dr. Ana Pop","service":"Routine cleaning","date":"2026-05-08","time":"12:30","status":"Scheduled","notes":"Created during demo","favorite":false}'

Invoke-RestMethod -Method Put -Uri "http://localhost:3000/api/appointments/$($created.id)" -Headers $headers -ContentType "application/json" -Body '{"status":"Confirmed","favorite":true}'

Invoke-WebRequest -Method Delete -Uri "http://localhost:3000/api/appointments/$($created.id)" -Headers $headers
```

Forbidden permission example:

```powershell
$visitor = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/token" -ContentType "application/json" -Body '{"role":"VISITOR"}'
$visitorHeaders = @{ Authorization = "Bearer $($visitor.token)" }
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/appointments" -Headers $visitorHeaders -ContentType "application/json" -Body '{"patient":"Blocked","dentist":"Dr. Ana Pop","service":"Routine cleaning","date":"2026-05-08","time":"12:45","status":"Scheduled"}'
```

Expected result: HTTP `403`, because `VISITOR` has only `READ`.

## Verification Already Run

Commands:

```bash
npm run typecheck
npm run build
```

Result: both passed.

Smoke-test result on a temporary local server:

- `POST /token`: `200`, role `ADMIN`, expiration `60` seconds.
- `GET /api/appointments?limit=2&offset=0`: `200`, returned a paginated page.
- `POST /api/appointments`: `201`.
- `PUT /api/appointments/{id}`: `200`.
- `DELETE /api/appointments/{id}`: `204`.
- `GET /api/openapi`: `200`.
- `GET /docs`: `200`.
- `POST /api/appointments` with `VISITOR`: `403`.

## Links Accessed

- Lab 6 instructions: https://gist.github.com/strdr4605/15e0feff916d97e36415be547c31fd62
- REST reference: https://restfulapi.net/
- JWT reference: https://jwt.io/
- Swagger UI: https://swagger.io/tools/swagger-ui/
- Pagination best practices: https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design#filter-and-paginate-data
- GraphQL reference: https://graphql.org/
- gRPC reference: https://grpc.io/
- Submission page: https://else.fcim.utm.md/mod/assign/view.php?id=48727

The submission page redirects to the ELSE login screen from this environment. You will need to log in with your university account to read or submit the final assignment there.

## What You May Need To Do

- Log in to ELSE and confirm any private submission details.
- For deployment, use a Node-compatible host, not only GitHub Pages.
- Optionally set `JWT_SECRET` in the deployment environment. Without it, the app uses a development fallback secret.
