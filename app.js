const STORAGE_KEY = "dental-clinic-appointments";

const initialAppointments = [
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

const emptyForm = {
  patient: "",
  dentist: "Dr. Ana Pop",
  service: "Routine cleaning",
  date: "2026-05-07",
  time: "10:00",
  status: "Scheduled",
  notes: ""
};

function loadAppointments() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialAppointments;
  } catch {
    return initialAppointments;
  }
}

function App() {
  const [appointments, setAppointments] = React.useState(loadAppointments);
  const [form, setForm] = React.useState(emptyForm);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  }, [appointments]);

  const stats = React.useMemo(() => {
    const urgent = appointments.filter((item) => item.status === "Urgent").length;
    const confirmed = appointments.filter((item) => item.status === "Confirmed").length;
    const favorites = appointments.filter((item) => item.favorite).length;

    return [
      { label: "Appointments", value: appointments.length },
      { label: "Confirmed", value: confirmed },
      { label: "Urgent cases", value: urgent },
      { label: "Priority patients", value: favorites }
    ];
  }, [appointments]);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function addAppointment(event) {
    event.preventDefault();

    const nextAppointment = {
      ...form,
      id: crypto.randomUUID(),
      patient: form.patient.trim(),
      notes: form.notes.trim() || "No extra notes.",
      favorite: false
    };

    setAppointments((current) =>
      [...current, nextAppointment].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    );
    setForm(emptyForm);
  }

  function removeAppointment(id) {
    setAppointments((current) => current.filter((appointment) => appointment.id !== id));
  }

  function toggleFavorite(id) {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id ? { ...appointment, favorite: !appointment.favorite } : appointment
      )
    );
  }

  function updateStatus(id, status) {
    setAppointments((current) =>
      current.map((appointment) => (appointment.id === id ? { ...appointment, status } : appointment))
    );
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">DC</div>
          <div>
            <p className="eyebrow">Lab 6 Front-end</p>
            <h1>Dental Clinic Appointment Manager</h1>
          </div>
        </div>
      </header>

      <section className="hero" aria-labelledby="overview-title">
        <div className="hero-panel">
          <p className="eyebrow">Today at a glance</p>
          <h2 id="overview-title">Coordinate dentists, patients, services, and visit priorities from one clean desk.</h2>
          <p>
            A client-side scheduling workspace for a small dental clinic. The app keeps appointments in the browser,
            shows operational signals, and gives reception staff quick access to the upcoming queue.
          </p>
          <div className="stats-grid">
            {stats.map((stat) => (
              <div className="stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-art" role="img" aria-label="Bright modern dental clinic room"></div>
      </section>

      <section className="workspace">
        <form className="appointment-form" aria-label="Add appointment" onSubmit={addAppointment}>
          <div>
            <p className="eyebrow">New booking</p>
            <h2>Add appointment</h2>
          </div>

          <label>
            Patient name
            <input
              name="patient"
              value={form.patient}
              onChange={updateForm}
              placeholder="e.g. Daniel Marin"
              required
            />
          </label>

          <div className="form-grid">
            <label>
              Dentist
              <select name="dentist" value={form.dentist} onChange={updateForm}>
                <option>Dr. Ana Pop</option>
                <option>Dr. Mihai Sandu</option>
                <option>Dr. Irina Ciobanu</option>
              </select>
            </label>

            <label>
              Service
              <select name="service" value={form.service} onChange={updateForm}>
                <option>Routine cleaning</option>
                <option>Dental filling</option>
                <option>Orthodontic check</option>
                <option>Tooth extraction</option>
                <option>Whitening consultation</option>
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              Date
              <input name="date" type="date" value={form.date} onChange={updateForm} required />
            </label>

            <label>
              Time
              <input name="time" type="time" value={form.time} onChange={updateForm} required />
            </label>
          </div>

          <label>
            Status
            <select name="status" value={form.status} onChange={updateForm}>
              <option>Scheduled</option>
              <option>Confirmed</option>
              <option>Urgent</option>
              <option>Completed</option>
            </select>
          </label>

          <label>
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={updateForm}
              rows="4"
              placeholder="Allergies, scan reminders, follow-up context..."
            />
          </label>

          <button className="primary-button" type="submit">Add appointment</button>
        </form>

        <section className="schedule-panel" aria-labelledby="schedule-title">
        <div className="section-head">
          <div>
            <p className="eyebrow">Appointment board</p>
            <h2 id="schedule-title">Upcoming visits</h2>
          </div>
          <span className="tag">{appointments.length} active records</span>
        </div>

        <div className="appointment-list">
          {appointments.map((appointment) => (
            <article className="appointment-card" key={appointment.id}>
              <div className="card-top">
                <div>
                  <h3>{appointment.patient}</h3>
                  <span className="tag">{appointment.status}</span>
                </div>
                <button
                  className={`icon-button ${appointment.favorite ? "is-active" : ""}`}
                  type="button"
                  onClick={() => toggleFavorite(appointment.id)}
                  aria-label={appointment.favorite ? "Remove priority mark" : "Mark as priority"}
                  title={appointment.favorite ? "Remove priority mark" : "Mark as priority"}
                >
                  ★
                </button>
              </div>
              <div className="detail-list">
                <div><span>Dentist:</span> {appointment.dentist}</div>
                <div><span>Service:</span> {appointment.service}</div>
                <div><span>Date:</span> {appointment.date}</div>
                <div><span>Time:</span> {appointment.time}</div>
                <div><span>Notes:</span> {appointment.notes}</div>
              </div>
              <div className="card-actions">
                <select
                  value={appointment.status}
                  onChange={(event) => updateStatus(appointment.id, event.target.value)}
                  aria-label={`Change status for ${appointment.patient}`}
                >
                  <option>Scheduled</option>
                  <option>Confirmed</option>
                  <option>Urgent</option>
                  <option>Completed</option>
                </select>
                <button className="danger-button" type="button" onClick={() => removeAppointment(appointment.id)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
        </section>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
