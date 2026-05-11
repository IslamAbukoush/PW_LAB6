export type AppointmentStatus = "Scheduled" | "Confirmed" | "Urgent" | "Completed";
export type SortMode = "soonest" | "latest";

export type Appointment = {
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

export const statusOptions: AppointmentStatus[] = ["Scheduled", "Confirmed", "Urgent", "Completed"];

export const dentistOptions = ["Dr. Ana Pop", "Dr. Mihai Sandu", "Dr. Irina Ciobanu"];

export const serviceOptions = [
  "Routine cleaning",
  "Dental filling",
  "Orthodontic check",
  "Tooth extraction",
  "Whitening consultation"
];

const baseAppointments: Appointment[] = [
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

const patientNames = [
  "Daniel Marin",
  "Irina Matei",
  "Sergiu Plamadeala",
  "Otilia Grama",
  "Andrei Burlacu",
  "Cristina Lupu",
  "Nicu Ciobanu",
  "Alina Grosu",
  "Radu Moraru",
  "Diana Munteanu",
  "Tudor Cazacu",
  "Olga Balan",
  "Ion Ursu",
  "Natalia Florea",
  "Vasile Melnic",
  "Sorina Rotaru",
  "Petru Enache",
  "Lilia Toma",
  "Mihail Sava",
  "Doina Cojocaru",
  "Alexandru Cretu",
  "Paula Neagu",
  "Eugen Prisacari",
  "Mihaela Rusu",
  "Valeriu Popa",
  "Nina Craciun",
  "Dorin Anton",
  "Tatiana Barbu",
  "Stefan Muntean",
  "Larisa Gherman",
  "Vlad Sandu",
  "Adriana Mocanu",
  "Corneliu Stoica",
  "Marina Dobre",
  "Gheorghe Chiriac",
  "Anca Savin",
  "Iurie Donici",
  "Camelia Pavel",
  "Roman Lungu",
  "Ioana Tataru",
  "Grigore Dima",
  "Sanda Croitoru",
  "Emil Baciu",
  "Nadejda Zaharia",
  "Ciprian Vrabie"
];

const appointmentDates = [
  "2026-05-07",
  "2026-05-08",
  "2026-05-09",
  "2026-05-10",
  "2026-05-11",
  "2026-05-12",
  "2026-05-13",
  "2026-05-14",
  "2026-05-15",
  "2026-05-16",
  "2026-05-17",
  "2026-05-18",
  "2026-05-19",
  "2026-05-20",
  "2026-05-21"
];

const appointmentTimes = [
  "09:00",
  "09:30",
  "10:00",
  "10:45",
  "11:15",
  "12:00",
  "13:30",
  "14:00",
  "14:45",
  "15:15",
  "16:00",
  "16:30"
];

const appointmentNotes = [
  "First visit at this clinic.",
  "Requested reminder call one day before.",
  "Has sensitivity to cold water.",
  "Needs invoice for insurance.",
  "Follow-up after previous treatment.",
  "Prefers a quieter treatment room.",
  "Asked for a short consultation before procedure.",
  "Arrives with recent dental X-ray.",
  "Needs treatment plan review.",
  "Patient may be ten minutes late."
];

const generatedAppointments: Appointment[] = patientNames.map((patient, index) => ({
  id: `apt-${index + baseAppointments.length + 1}`,
  patient,
  dentist: dentistOptions[index % dentistOptions.length],
  service: serviceOptions[(index + 1) % serviceOptions.length],
  date: appointmentDates[index % appointmentDates.length],
  time: appointmentTimes[(index * 2) % appointmentTimes.length],
  status: statusOptions[index % statusOptions.length],
  notes: appointmentNotes[index % appointmentNotes.length],
  favorite: index % 7 === 0 || index % 13 === 0
}));

export const initialAppointments: Appointment[] = [...baseAppointments, ...generatedAppointments].sort((first, second) =>
  `${first.date} ${first.time}`.localeCompare(`${second.date} ${second.time}`)
);
