"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type AppointmentStatus = "Scheduled" | "Confirmed" | "Urgent" | "Completed";
type Theme = "light" | "dark";
type SortMode = "soonest" | "latest";
type ViewMode = "board" | "timeline";

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

type DentistAvailability = {
  dentist: string;
  count: number;
  capacity: number;
  nextAppointment?: Appointment;
  state: "Available" | "Busy soon" | "Full schedule";
};

type IconName = "overview" | "calendar" | "doctors" | "intake";

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

const navigationItems: { label: string; href: string; icon: IconName }[] = [
  { label: "Overview", href: "#overview", icon: "overview" },
  { label: "Availability", href: "#availability", icon: "doctors" },
  { label: "Schedule", href: "#schedule", icon: "calendar" },
  { label: "Intake", href: "#intake", icon: "intake" }
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

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date(`${date}T12:00`));
}

function formatTime(time: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(`2026-01-01T${time}`));
}

function statusClass(status: AppointmentStatus) {
  return `status status--${status.toLowerCase()}`;
}

function availabilityClass(state: DentistAvailability["state"]) {
  return `availability-state availability-state--${state.toLowerCase().replace(" ", "-")}`;
}

function ClinicIcon({ name }: { name: IconName }) {
  const paths = {
    overview: (
      <>
        <path d="M4 12h6V4H4v8Z" />
        <path d="M14 20h6V4h-6v16Z" />
        <path d="M4 20h6v-4H4v4Z" />
      </>
    ),
    calendar: (
      <>
        <path d="M7 3v3" />
        <path d="M17 3v3" />
        <path d="M4 8h16" />
        <path d="M5 5h14v15H5V5Z" />
      </>
    ),
    doctors: (
      <>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M4 21a8 8 0 0 1 16 0" />
        <path d="M18 14v5" />
        <path d="M15.5 16.5h5" />
      </>
    ),
    intake: (
      <>
        <path d="M6 3h9l3 3v15H6V3Z" />
        <path d="M14 3v4h4" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </>
    )
  };

  return (
    <svg aria-hidden="true" className="icon" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

export default function Home() {
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [theme, setTheme] = useState<Theme>("light");
  const [form, setForm] = useState<AppointmentForm>(emptyForm);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [selectedDate, setSelectedDate] = useState(initialAppointments[0].date);
  const [viewMode, setViewMode] = useState<ViewMode>("board");

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

  const scheduleDates = useMemo(
    () => Array.from(new Set(appointments.map((appointment) => appointment.date))).sort(),
    [appointments]
  );
  const availableScheduleDates = scheduleDates.length > 0 ? scheduleDates : [selectedDate];

  useEffect(() => {
    if (scheduleDates.length > 0 && !scheduleDates.includes(selectedDate)) {
      setSelectedDate(scheduleDates[0]);
    }
  }, [scheduleDates, selectedDate]);

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

  const dentistAvailability = useMemo<DentistAvailability[]>(() => {
    const allDentists = Array.from(new Set([...dentistOptions, ...appointments.map((appointment) => appointment.dentist)]));

    return allDentists.map((dentist) => {
      const dailyAppointments = appointments
        .filter((appointment) => appointment.dentist === dentist && appointment.date === selectedDate)
        .sort((first, second) => first.time.localeCompare(second.time));
      const capacity = 6;
      const count = dailyAppointments.length;
      const state = count >= capacity ? "Full schedule" : count >= 3 ? "Busy soon" : "Available";

      return {
        dentist,
        count,
        capacity,
        nextAppointment: dailyAppointments[0],
        state
      };
    });
  }, [appointments, selectedDate]);

  const selectedDateAppointments = useMemo(
    () => visibleAppointments.filter((appointment) => appointment.date === selectedDate),
    [selectedDate, visibleAppointments]
  );

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
    setSelectedDate(nextAppointment.date);
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
    <div className="app-frame">
      <aside className="clinic-sidebar" aria-label="Clinic navigation">
        <div className="sidebar-brand">
          <div className="brand-mark" aria-hidden="true">
            DC
          </div>
          <div>
            <strong>DentaCare</strong>
            <span>Appointment desk</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <a href={item.href} key={item.label}>
              <ClinicIcon name={item.icon} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-note">
          <span>Clinic status</span>
          <strong>Open for scheduled visits</strong>
          <p>Hygiene room available after 14:00.</p>
        </div>
      </aside>

      <main className="clinic-shell" id="overview">
      <header className="topbar">
        <div className="brand">
          <div>
            <p className="eyebrow">Dental clinic command center</p>
            <h1>Front desk dashboard</h1>
          </div>
        </div>

        <button className="button button--secondary" type="button" onClick={toggleTheme}>
          {theme === "light" ? "Dark mode" : "Light mode"}
        </button>
      </header>

      <section className="overview" aria-labelledby="overview-title">
        <div className="overview-copy">
          <p className="eyebrow">Today&apos;s care flow</p>
          <h2 id="overview-title">A calmer way to coordinate dentists, rooms, and patient arrivals.</h2>
          <p>
            Track availability, schedule pressure, priority patients, and upcoming visits from a single receptionist view.
          </p>
          <div className="care-metrics" aria-label="Clinic operating highlights">
            <div>
              <span>Working hours</span>
              <strong>09:00 - 18:00</strong>
            </div>
            <div>
              <span>Active dentists</span>
              <strong>{dentistOptions.length}</strong>
            </div>
            <div>
              <span>Selected day</span>
              <strong>{formatDateLabel(selectedDate)}</strong>
            </div>
          </div>
        </div>

        <div className="clinic-photo" role="img" aria-label="Modern dental clinic treatment room">
          <span>Care rooms prepared</span>
          <strong>Sterile, calm, on schedule</strong>
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

      <section className="availability-panel" aria-labelledby="availability-title" id="availability">
        <div className="availability-heading">
          <div>
            <p className="eyebrow">Dentist availability</p>
            <h2 id="availability-title">{formatDateLabel(selectedDate)}</h2>
          </div>
          <label className="field date-picker">
            <span>Schedule date</span>
            <select value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)}>
              {availableScheduleDates.map((date) => (
                <option key={date} value={date}>
                  {formatDateLabel(date)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="availability-grid">
          {dentistAvailability.map((item) => {
            const load = Math.min(100, Math.round((item.count / item.capacity) * 100));

            return (
              <article className="availability-card" key={item.dentist}>
                <div className="availability-card__top">
                  <div>
                    <h3>{item.dentist}</h3>
                    <p>{item.nextAppointment ? `Next: ${formatTime(item.nextAppointment.time)}` : "No visits planned"}</p>
                  </div>
                  <span className={availabilityClass(item.state)}>{item.state}</span>
                </div>
                <div className="load-meter" aria-label={`${item.dentist} workload ${load}%`}>
                  <span style={{ width: `${load}%` }} />
                </div>
                <div className="availability-meta">
                  <strong>
                    {item.count}/{item.capacity}
                  </strong>
                  <span>daily capacity</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="workspace">
        <form className="booking-panel" aria-label="Add appointment" id="intake" onSubmit={addAppointment}>
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

        <section className="schedule-board" aria-labelledby="schedule-title" id="schedule">
          <div className="board-heading">
            <div>
              <p className="eyebrow">Appointment board</p>
              <h2 id="schedule-title">Upcoming visits</h2>
            </div>
            <span className="record-count">{appointments.length} active records</span>
          </div>

          <div className="view-tabs" aria-label="Schedule view">
            <button
              className={`view-tab ${viewMode === "board" ? "is-active" : ""}`}
              type="button"
              onClick={() => setViewMode("board")}
            >
              Board
            </button>
            <button
              className={`view-tab ${viewMode === "timeline" ? "is-active" : ""}`}
              type="button"
              onClick={() => setViewMode("timeline")}
            >
              Timeline
            </button>
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

          {viewMode === "board" ? (
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
          ) : (
            <div className="timeline-view" aria-label={`${formatDateLabel(selectedDate)} timeline`}>
              <div className="timeline-header">
                <strong>{formatDateLabel(selectedDate)}</strong>
                <span>{selectedDateAppointments.length} matching visits</span>
              </div>
              <div className="timeline-list">
                {selectedDateAppointments.map((appointment) => (
                  <article className="timeline-item" key={appointment.id}>
                    <time>{formatTime(appointment.time)}</time>
                    <div className="timeline-dot" aria-hidden="true" />
                    <div className="timeline-card">
                      <div>
                        <h3>{appointment.patient}</h3>
                        <p>
                          {appointment.service} with {appointment.dentist}
                        </p>
                      </div>
                      <span className={statusClass(appointment.status)}>{appointment.status}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {((viewMode === "board" && visibleAppointments.length === 0) ||
            (viewMode === "timeline" && selectedDateAppointments.length === 0)) && (
            <div className="empty-state">
              <h3>No appointments found</h3>
              <p>Adjust the filters, pick another date, or add a new booking for this schedule.</p>
            </div>
          )}
        </section>
      </section>
      </main>
    </div>
  );
}
