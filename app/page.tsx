"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type AppointmentStatus = "Scheduled" | "Confirmed" | "Urgent" | "Completed";
type Theme = "light" | "dark";
type SortMode = "soonest" | "latest";

type Appointment = {
  id: string;
  patient: string;
  dentist: string;
  service: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes: string;
  favorite: boolean;
};

type AppointmentForm = Omit<Appointment, "id" | "favorite">;

type Filters = {
  query: string;
  status: AppointmentStatus | "All";
  dentist: string;
  priorityOnly: boolean;
  sort: SortMode;
};

type Stat = {
  label: string;
  value: number;
  tone: "teal" | "amber" | "rose" | "blue";
};

const APPOINTMENTS_KEY = "dental-clinic-appointments";
const THEME_KEY = "dental-clinic-theme";

const statusOptions: AppointmentStatus[] = ["Scheduled", "Confirmed", "Urgent", "Completed"];

const dentistOptions = ["Dr. Ana Pop", "Dr. Mihai Sandu", "Dr. Irina Ciobanu"];

const serviceOptions = [
  "Routine cleaning",
  "Dental filling",
  "Orthodontic check",
  "Tooth extraction",
  "Whitening consultation"
];

const initialAppointments: Appointment[] = [
  {
    id: "apt-1",
    patient: "Mara Ionescu",
    dentist: "Dr. Ana Pop",
    service: "Routine cleaning",
    date: "2026-05-05",
    time: "09:30",
    status: "Scheduled",
    notes: "Prefers morning appointments.",
    favorite: true
  },
  {
    id: "apt-2",
    patient: "Victor Rusu",
    dentist: "Dr. Mihai Sandu",
    service: "Orthodontic check",
    date: "2026-05-05",
    time: "13:00",
    status: "Confirmed",
    notes: "Bring recent panoramic scan.",
    favorite: false
  },
  {
    id: "apt-3",
    patient: "Elena Ceban",
    dentist: "Dr. Ana Pop",
    service: "Tooth extraction",
    date: "2026-05-06",
    time: "11:15",
    status: "Urgent",
    notes: "Follow up after emergency call.",
    favorite: false
  }
];

const emptyForm: AppointmentForm = {
  patient: "",
  dentist: dentistOptions[0],
  service: serviceOptions[0],
  date: "2026-05-07",
  time: "10:00",
  status: "Scheduled",
  notes: ""
};

const initialFilters: Filters = {
  query: "",
  status: "All",
  dentist: "All",
  priorityOnly: false,
  sort: "soonest"
};

function readAppointments(): Appointment[] {
  if (typeof window === "undefined") {
    return initialAppointments;
  }

  try {
    const stored = window.localStorage.getItem(APPOINTMENTS_KEY);
    return stored ? (JSON.parse(stored) as Appointment[]) : initialAppointments;
  } catch {
    return initialAppointments;
  }
}

function readTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

function formatVisitDate(date: string, time: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(`${date}T${time}`));
}

function statusClass(status: AppointmentStatus) {
  return `status status--${status.toLowerCase()}`;
}

export default function Home() {
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [theme, setTheme] = useState<Theme>("light");
  const [form, setForm] = useState<AppointmentForm>(emptyForm);
  const [filters, setFilters] = useState<Filters>(initialFilters);

  useEffect(() => {
    setAppointments(readAppointments());
    setTheme(readTheme());
    setHasLoadedStorage(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    if (hasLoadedStorage) {
      window.localStorage.setItem(THEME_KEY, theme);
    }
  }, [hasLoadedStorage, theme]);

  useEffect(() => {
    if (hasLoadedStorage) {
      window.localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    }
  }, [appointments, hasLoadedStorage]);

  const dentists = useMemo(
    () => ["All", ...Array.from(new Set([...dentistOptions, ...appointments.map((appointment) => appointment.dentist)]))],
    [appointments]
  );

  const visibleAppointments = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return appointments
      .filter((appointment) => {
        const searchable = [appointment.patient, appointment.dentist, appointment.service, appointment.notes]
          .join(" ")
          .toLowerCase();

        return (
          (!query || searchable.includes(query)) &&
          (filters.status === "All" || appointment.status === filters.status) &&
          (filters.dentist === "All" || appointment.dentist === filters.dentist) &&
          (!filters.priorityOnly || appointment.favorite)
        );
      })
      .sort((first, second) => {
        const direction = filters.sort === "latest" ? -1 : 1;
        return direction * `${first.date} ${first.time}`.localeCompare(`${second.date} ${second.time}`);
      });
  }, [appointments, filters]);

  const stats = useMemo<Stat[]>(() => {
    const urgent = appointments.filter((item) => item.status === "Urgent").length;
    const confirmed = appointments.filter((item) => item.status === "Confirmed").length;
    const favorites = appointments.filter((item) => item.favorite).length;

    return [
      { label: "Appointments", value: appointments.length, tone: "teal" },
      { label: "Confirmed", value: confirmed, tone: "blue" },
      { label: "Urgent cases", value: urgent, tone: "rose" },
      { label: "Priority patients", value: favorites, tone: "amber" }
    ];
  }, [appointments]);

  function updateForm(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const name = event.target.name as keyof AppointmentForm;
    const { value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateFilter(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;

    if (event.target instanceof HTMLInputElement && name === "priorityOnly") {
      const { checked } = event.target;
      setFilters((current) => ({ ...current, priorityOnly: checked }));
      return;
    }

    if (name === "query") {
      setFilters((current) => ({ ...current, query: value }));
    }

    if (name === "status") {
      setFilters((current) => ({ ...current, status: value as Filters["status"] }));
    }

    if (name === "dentist") {
      setFilters((current) => ({ ...current, dentist: value }));
    }

    if (name === "sort") {
      setFilters((current) => ({ ...current, sort: value as SortMode }));
    }
  }

  function addAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextAppointment: Appointment = {
      ...form,
      id: crypto.randomUUID(),
      patient: form.patient.trim(),
      notes: form.notes.trim() || "No extra notes.",
      favorite: false
    };

    setAppointments((current) =>
      [...current, nextAppointment].sort((first, second) =>
        `${first.date} ${first.time}`.localeCompare(`${second.date} ${second.time}`)
      )
    );
    setForm(emptyForm);
  }

  function removeAppointment(id: string) {
    setAppointments((current) => current.filter((appointment) => appointment.id !== id));
  }

  function toggleFavorite(id: string) {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id ? { ...appointment, favorite: !appointment.favorite } : appointment
      )
    );
  }

  function updateStatus(id: string, status: AppointmentStatus) {
    setAppointments((current) =>
      current.map((appointment) => (appointment.id === id ? { ...appointment, status } : appointment))
    );
  }

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  return (
    <main className="clinic-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            DC
          </div>
          <div>
            <p className="eyebrow">Lab 6 Front-end</p>
            <h1>Dental Clinic Appointment Manager</h1>
          </div>
        </div>

        <button className="button button--secondary" type="button" onClick={toggleTheme}>
          {theme === "light" ? "Dark mode" : "Light mode"}
        </button>
      </header>

      <section className="overview" aria-labelledby="overview-title">
        <div className="overview-copy">
          <p className="eyebrow">Reception workspace</p>
          <h2 id="overview-title">A tidy command center for visits, priorities, and dentist availability.</h2>
          <p>
            Add bookings, triage urgent visits, and keep the active queue searchable without leaving the browser.
          </p>
        </div>

        <div className="clinic-photo" role="img" aria-label="Modern dental clinic treatment room">
          <span>Open today</span>
          <strong>09:00 - 18:00</strong>
        </div>
      </section>

      <section className="stats-grid" aria-label="Appointment summary">
        {stats.map((stat) => (
          <article className={`stat-card stat-card--${stat.tone}`} key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="workspace">
        <form className="booking-panel" aria-label="Add appointment" onSubmit={addAppointment}>
          <div className="panel-heading">
            <p className="eyebrow">New booking</p>
            <h2>Add appointment</h2>
          </div>

          <label className="field">
            <span>Patient name</span>
            <input
              name="patient"
              value={form.patient}
              onChange={updateForm}
              placeholder="e.g. Daniel Marin"
              required
            />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Dentist</span>
              <select name="dentist" value={form.dentist} onChange={updateForm}>
                {dentistOptions.map((dentist) => (
                  <option key={dentist}>{dentist}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Service</span>
              <select name="service" value={form.service} onChange={updateForm}>
                {serviceOptions.map((service) => (
                  <option key={service}>{service}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Date</span>
              <input name="date" type="date" value={form.date} onChange={updateForm} required />
            </label>

            <label className="field">
              <span>Time</span>
              <input name="time" type="time" value={form.time} onChange={updateForm} required />
            </label>
          </div>

          <label className="field">
            <span>Status</span>
            <select name="status" value={form.status} onChange={updateForm}>
              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Notes</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={updateForm}
              rows={4}
              placeholder="Allergies, scan reminders, follow-up context..."
            />
          </label>

          <button className="button button--primary" type="submit">
            Add appointment
          </button>
        </form>

        <section className="schedule-board" aria-labelledby="schedule-title">
          <div className="board-heading">
            <div>
              <p className="eyebrow">Appointment board</p>
              <h2 id="schedule-title">Upcoming visits</h2>
            </div>
            <span className="record-count">{appointments.length} active records</span>
          </div>

          <div className="filters" aria-label="Appointment filters">
            <label className="field">
              <span>Search</span>
              <input
                name="query"
                value={filters.query}
                onChange={updateFilter}
                placeholder="Patient, dentist, service..."
              />
            </label>

            <label className="field">
              <span>Status</span>
              <select name="status" value={filters.status} onChange={updateFilter}>
                <option>All</option>
                {statusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Dentist</span>
              <select name="dentist" value={filters.dentist} onChange={updateFilter}>
                {dentists.map((dentist) => (
                  <option key={dentist}>{dentist}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Sort</span>
              <select name="sort" value={filters.sort} onChange={updateFilter}>
                <option value="soonest">Soonest first</option>
                <option value="latest">Latest first</option>
              </select>
            </label>

            <label className="check-field">
              <input
                name="priorityOnly"
                type="checkbox"
                checked={filters.priorityOnly}
                onChange={updateFilter}
              />
              <span>Priority only</span>
            </label>
          </div>

          <div className="appointment-list">
            {visibleAppointments.map((appointment) => (
              <article className="appointment-card" key={appointment.id}>
                <div className="appointment-card__top">
                  <div>
                    <p className="appointment-card__time">{formatVisitDate(appointment.date, appointment.time)}</p>
                    <h3>{appointment.patient}</h3>
                  </div>
                  <span className={statusClass(appointment.status)}>{appointment.status}</span>
                </div>

                <div className="appointment-details">
                  <div>
                    <span>Dentist</span>
                    <strong>{appointment.dentist}</strong>
                  </div>
                  <div>
                    <span>Service</span>
                    <strong>{appointment.service}</strong>
                  </div>
                  <div className="appointment-details__full">
                    <span>Notes</span>
                    <strong>{appointment.notes}</strong>
                  </div>
                </div>

                <div className="appointment-actions">
                  <button
                    className={`button button--compact ${appointment.favorite ? "button--accent" : "button--ghost"}`}
                    type="button"
                    onClick={() => toggleFavorite(appointment.id)}
                    aria-pressed={appointment.favorite}
                  >
                    {appointment.favorite ? "Priority" : "Mark priority"}
                  </button>

                  <select
                    value={appointment.status}
                    onChange={(event) => updateStatus(appointment.id, event.target.value as AppointmentStatus)}
                    aria-label={`Change status for ${appointment.patient}`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>

                  <button className="button button--danger" type="button" onClick={() => removeAppointment(appointment.id)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          {visibleAppointments.length === 0 && (
            <div className="empty-state">
              <h3>No appointments found</h3>
              <p>Adjust the filters or add a new booking for the selected dentist and status.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
