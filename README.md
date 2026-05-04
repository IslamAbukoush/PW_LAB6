# Dental Clinic Appointment Manager

Client-side only React application for Laboratory Work 6. The app helps a small dental clinic manage patient appointments directly in the browser.

## Topic

Dental Clinic Appointment Manager

## Description

The application is a reception desk workspace for a dental clinic. It keeps an appointment board with patient name, dentist, service, date, time, status, notes, and a priority marker. Reception staff can create new appointments, remove outdated ones, update the visit status, mark important patients, search the schedule, and filter the visible queue.

The interface includes a custom dental clinic theme and supports both light and dark modes. Appointment data and the selected theme are stored in `localStorage`, while the rest of the UI state runs in memory.

## Main Flows

1. Add an appointment
   - Fill in patient name, dentist, service, date, time, status, and optional notes.
   - Submit the form.
   - The appointment appears in the appointment board and is saved in the browser.

2. Manage an appointment
   - Use the status selector on an appointment card to change between `Scheduled`, `Confirmed`, `Urgent`, and `Completed`.
   - Use the star button to mark or unmark a priority patient.
   - Use the remove button to delete an appointment.

3. Find appointments
   - Search by patient, dentist, service, or notes.
   - Filter by status.
   - Filter by dentist.
   - Show only priority appointments.
   - Sort appointments by soonest or latest visit time.

4. Change theme
   - Use the theme button in the header to switch between light and dark mode.
   - The selected theme is kept after refresh.

## Client Requirements Coverage

- Entities: appointments.
- Entity operations: add, remove, update status, mark priority, search, filter, and sort.
- Custom style: clinic dashboard layout with responsive cards and custom colors.
- Light/dark version: stored theme toggle.
- Public hosting: the project is ready for GitHub Pages or any static hosting service.

## Dev Requirements Coverage

- Framework/library: React 18.
- Runtime state: form data, filters, and derived visible appointments.
- Browser storage: appointments and theme are saved in `localStorage`.
- Git history: implemented in five checkpoint commits.
- Hosting: no backend and no build step required.

## Run Locally

Open `index.html` in a browser, or serve the folder with any static server.

```bash
python -m http.server 5173
```

Then open `http://localhost:5173`.

The app loads React from public CDN links, so an internet connection is needed when running it locally.

## GitHub Pages Deployment

1. Push the repository to GitHub.
2. Open repository `Settings`.
3. Go to `Pages`.
4. Set source to the `main` branch and root folder.
5. Save and use the generated public URL for submission.
