const initialAppointments = [
  {
    id: crypto.randomUUID(),
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
    id: crypto.randomUUID(),
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
    id: crypto.randomUUID(),
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

function App() {
  const [appointments] = React.useState(initialAppointments);

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
                <strong>{appointment.time}</strong>
              </div>
              <div className="detail-list">
                <div><span>Dentist:</span> {appointment.dentist}</div>
                <div><span>Service:</span> {appointment.service}</div>
                <div><span>Date:</span> {appointment.date}</div>
                <div><span>Notes:</span> {appointment.notes}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
