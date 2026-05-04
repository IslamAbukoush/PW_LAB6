# Dental Clinic Appointment Manager

Client-side only Next.js + TypeScript application for Laboratory Work 6. The app helps a small dental clinic manage patient appointments directly in the browser.

## Topic

Dental Clinic Appointment Manager

## Description

The application is a reception desk workspace for a dental clinic. It keeps an appointment board with patient name, dentist, service, date, time, status, notes, and a priority marker. Reception staff can create new appointments, remove outdated ones, update the visit status, mark important patients, search the schedule, and filter the visible queue.

The interface includes a consistent dental clinic dashboard theme and supports both light and dark modes. Appointment data and the selected theme are stored in `localStorage`, while the rest of the UI state runs in memory.

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
- Custom style: responsive clinic dashboard layout, shared design tokens, consistent form controls, cards, badges, and buttons.
- Light/dark version: stored theme toggle.
- Public hosting: the project is ready for GitHub Pages or any static hosting service.

## Dev Requirements Coverage

- Framework/library: Next.js with React and TypeScript.
- Runtime state: form data, filters, and derived visible appointments.
- Browser storage: appointments and theme are saved in `localStorage`.
- Git history: implemented through checkpoint commits.
- Hosting: static export is enabled with `output: "export"` in `next.config.mjs`.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

Then open `http://localhost:3000`.

Run a production static build:

```bash
npm run build
```

The exported static files are generated in `out/`.

## GitHub Pages Deployment

1. Push the repository to GitHub.
2. Open repository `Settings`.
3. Go to `Pages`.
4. Build the project with `npm run build`.
5. Publish the generated `out/` folder with GitHub Pages, GitHub Actions, or another static host.
6. Use the generated public URL for submission.
