import { randomUUID } from "node:crypto";

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

export type AppointmentInput = Omit<Appointment, "id">;
export type AppointmentUpdate = Partial<AppointmentInput>;

export type AppointmentListParams = {
  query?: string;
  status?: AppointmentStatus | "All";
  dentist?: string;
  priorityOnly?: boolean;
  sort?: SortMode;
  limit: number;
  offset: number;
};

export type AppointmentListResult = {
  data: Appointment[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    returned: number;
    nextOffset: number | null;
    previousOffset: number | null;
  };
};

export type ValidationResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: string;
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

export const initialAppointments: Appointment[] = [
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

let appointments: Appointment[] = [...initialAppointments];

export function listAppointments(params: AppointmentListParams): AppointmentListResult {
  const query = params.query?.trim().toLowerCase() ?? "";
  const status = params.status ?? "All";
  const dentist = params.dentist ?? "All";
  const sort = params.sort ?? "soonest";

  const filtered = appointments
    .filter((appointment) => {
      const searchable = [appointment.patient, appointment.dentist, appointment.service, appointment.notes]
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (status === "All" || appointment.status === status) &&
        (dentist === "All" || appointment.dentist === dentist) &&
        (!params.priorityOnly || appointment.favorite)
      );
    })
    .sort((first, second) => {
      const direction = sort === "latest" ? -1 : 1;
      return direction * `${first.date} ${first.time}`.localeCompare(`${second.date} ${second.time}`);
    });

  const data = filtered.slice(params.offset, params.offset + params.limit);

  return {
    data,
    pagination: {
      total: filtered.length,
      limit: params.limit,
      offset: params.offset,
      returned: data.length,
      nextOffset: params.offset + params.limit < filtered.length ? params.offset + params.limit : null,
      previousOffset: params.offset > 0 ? Math.max(0, params.offset - params.limit) : null
    }
  };
}

export function getAppointment(id: string): Appointment | null {
  return appointments.find((appointment) => appointment.id === id) ?? null;
}

export function createAppointment(input: unknown): ValidationResult<Appointment> {
  const validation = validateAppointmentInput(input);

  if (!validation.ok) {
    return validation;
  }

  const appointment: Appointment = {
    ...validation.value,
    id: randomUUID()
  };

  appointments = [...appointments, appointment].sort((first, second) =>
    `${first.date} ${first.time}`.localeCompare(`${second.date} ${second.time}`)
  );

  return { ok: true, value: appointment };
}

export function updateAppointment(id: string, input: unknown): ValidationResult<Appointment | null> {
  const current = getAppointment(id);

  if (!current) {
    return { ok: true, value: null };
  }

  const validation = validateAppointmentUpdate(input);

  if (!validation.ok) {
    return validation;
  }

  const nextAppointment = {
    ...current,
    ...validation.value
  };

  appointments = appointments.map((appointment) => (appointment.id === id ? nextAppointment : appointment));

  return { ok: true, value: nextAppointment };
}

export function deleteAppointment(id: string): boolean {
  const exists = appointments.some((appointment) => appointment.id === id);

  if (exists) {
    appointments = appointments.filter((appointment) => appointment.id !== id);
  }

  return exists;
}

export function parseListParams(searchParams: URLSearchParams): ValidationResult<AppointmentListParams> {
  const limit = Number(searchParams.get("limit") ?? "25");
  const offset = Number(searchParams.get("offset") ?? "0");
  const maxLimit = 100;

  if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit) {
    return { ok: false, error: `limit must be an integer from 1 to ${maxLimit}.` };
  }

  if (!Number.isInteger(offset) || offset < 0) {
    return { ok: false, error: "offset must be a non-negative integer." };
  }

  const status = searchParams.get("status") ?? "All";

  if (status !== "All" && !isAppointmentStatus(status)) {
    return { ok: false, error: "status must be All, Scheduled, Confirmed, Urgent, or Completed." };
  }

  const sort = searchParams.get("sort") ?? "soonest";

  if (sort !== "soonest" && sort !== "latest") {
    return { ok: false, error: "sort must be soonest or latest." };
  }

  return {
    ok: true,
    value: {
      query: searchParams.get("query") ?? "",
      status,
      dentist: searchParams.get("dentist") ?? "All",
      priorityOnly: searchParams.get("priorityOnly") === "true",
      sort,
      limit,
      offset
    }
  };
}

function validateAppointmentInput(input: unknown): ValidationResult<AppointmentInput> {
  if (!isRecord(input)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const requiredFields = ["patient", "dentist", "service", "date", "time", "status"] as const;
  const missingField = requiredFields.find((field) => !isNonEmptyString(input[field]));

  if (missingField) {
    return { ok: false, error: `${missingField} is required.` };
  }

  if (!isAppointmentStatus(input.status)) {
    return { ok: false, error: "status must be Scheduled, Confirmed, Urgent, or Completed." };
  }

  if (!isDateString(input.date)) {
    return { ok: false, error: "date must use YYYY-MM-DD format." };
  }

  if (!isTimeString(input.time)) {
    return { ok: false, error: "time must use HH:MM 24-hour format." };
  }

  const patient = String(input.patient).trim();
  const dentist = String(input.dentist).trim();
  const service = String(input.service).trim();

  return {
    ok: true,
    value: {
      patient,
      dentist,
      service,
      date: input.date,
      time: input.time,
      status: input.status,
      notes: isNonEmptyString(input.notes) ? input.notes.trim() : "No extra notes.",
      favorite: typeof input.favorite === "boolean" ? input.favorite : false
    }
  };
}

function validateAppointmentUpdate(input: unknown): ValidationResult<AppointmentUpdate> {
  if (!isRecord(input)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const update: AppointmentUpdate = {};

  if ("patient" in input) {
    if (!isNonEmptyString(input.patient)) {
      return { ok: false, error: "patient must be a non-empty string." };
    }
    update.patient = input.patient.trim();
  }

  if ("dentist" in input) {
    if (!isNonEmptyString(input.dentist)) {
      return { ok: false, error: "dentist must be a non-empty string." };
    }
    update.dentist = input.dentist.trim();
  }

  if ("service" in input) {
    if (!isNonEmptyString(input.service)) {
      return { ok: false, error: "service must be a non-empty string." };
    }
    update.service = input.service.trim();
  }

  if ("date" in input) {
    if (!isDateString(input.date)) {
      return { ok: false, error: "date must use YYYY-MM-DD format." };
    }
    update.date = input.date;
  }

  if ("time" in input) {
    if (!isTimeString(input.time)) {
      return { ok: false, error: "time must use HH:MM 24-hour format." };
    }
    update.time = input.time;
  }

  if ("status" in input) {
    if (!isAppointmentStatus(input.status)) {
      return { ok: false, error: "status must be Scheduled, Confirmed, Urgent, or Completed." };
    }
    update.status = input.status;
  }

  if ("notes" in input) {
    if (typeof input.notes !== "string") {
      return { ok: false, error: "notes must be a string." };
    }
    update.notes = input.notes.trim() || "No extra notes.";
  }

  if ("favorite" in input) {
    if (typeof input.favorite !== "boolean") {
      return { ok: false, error: "favorite must be a boolean." };
    }
    update.favorite = input.favorite;
  }

  return { ok: true, value: update };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return typeof value === "string" && statusOptions.includes(value as AppointmentStatus);
}

function isDateString(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00`));
}

function isTimeString(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
