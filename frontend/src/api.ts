
export interface Visit {
  id: number;
  full_name: string;
  company: string | null;
  host_name: string;
  checked_in_at: string;
  checked_out_at: string | null;
}

export interface CheckInInput {
  full_name: string;
  company: string;
  host_name: string;
}

export interface FieldErrors {
  [field: string]: string;
}

export class ApiError extends Error {
  status: number;
  fieldErrors: FieldErrors;

  constructor(
    message: string,
    status: number,
    fieldErrors: FieldErrors = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    let message = "An unexpected error occurred.";
    let fieldErrors: FieldErrors = {};

    if (isRecord(data)) {
      if (typeof data.message === "string") {
        message = data.message;
      }

      if (isRecord(data.errors)) {
        fieldErrors = Object.fromEntries(
          Object.entries(data.errors).filter(
            (entry): entry is [string, string] =>
              typeof entry[1] === "string",
          ),
        );
      }
    }

    throw new ApiError(message, response.status, fieldErrors);
  }

  return data as T;
}

export async function getVisits(search = ""): Promise<Visit[]> {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set("q", search.trim());
  }

  const query = params.toString();
  const url = query ? `/api/visits?${query}` : "/api/visits";

  return request<Visit[]>(url);
}

export async function checkInVisit(
  input: CheckInInput,
): Promise<Visit> {
  return request<Visit>("/api/visits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function checkOutVisit(id: number): Promise<Visit> {
  return request<Visit>(`/api/visits/${id}/check-out`, {
    method: "PATCH",
  });
}