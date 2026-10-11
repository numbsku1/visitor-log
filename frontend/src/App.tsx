
import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  checkInVisit,
  checkOutVisit,
  getVisits,
  type FieldErrors,
  type Visit,
} from "./api";
import "./App.css";

const emptyForm = {
  full_name: "",
  company: "",
  host_name: "",
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function validateForm(
  form: typeof emptyForm,
): FieldErrors {
  const errors: FieldErrors = {};
  const fullName = form.full_name.trim();
  const company = form.company.trim();
  const hostName = form.host_name.trim();

  if (!fullName) {
    errors.full_name = "Visitor name is required.";
  } else if (fullName.length > 100) {
    errors.full_name = "Must be 100 characters or fewer.";
  }

  if (company.length > 100) {
    errors.company = "Must be 100 characters or fewer.";
  }

  if (!hostName) {
    errors.host_name = "Person visiting is required.";
  } else if (hostName.length > 100) {
    errors.host_name = "Must be 100 characters or fewer.";
  }

  return errors;
}

function App() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkingOutId, setCheckingOutId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadVisits = useCallback(async (query = search) => {
    setLoading(true);

    try {
      const data = await getVisits(query);
      setVisits(data);
      setError("");
      return true;
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load today's visitors.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void loadVisits();
  }, [loadVisits]);

  function handleFieldChange(
    field: keyof typeof emptyForm,
    value: string,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setError("");
  }

  async function handleCheckIn(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const errors = validateForm(form);
    setFieldErrors(errors);
    setError("");

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      await checkInVisit({
        full_name: form.full_name.trim(),
        company: form.company.trim(),
        host_name: form.host_name.trim(),
      });

      setForm(emptyForm);
      setFieldErrors({});
      await loadVisits();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors);
        setError(
          Object.keys(err.fieldErrors).length > 0
            ? "Please correct the highlighted fields."
            : err.message,
        );
      } else {
        setError("Unable to check in this visitor. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCheckOut(id: number) {
    setError("");
    setCheckingOutId(id);

    try {
      await checkOutVisit(id);
      await loadVisits();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to check out this visitor.",
      );
    } finally {
      setCheckingOutId(null);
    }
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">FRONT DESK</p>
          <h1>Visitor Log</h1>
          <p className="page-description">
            Manage today's visitor check-ins and check-outs.
          </p>
        </div>
        <div className="date-label">
          {new Date().toLocaleDateString([], {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </header>

      {error && (
        <div className="alert" role="alert">
          <span>{error}</span>
          <button
            className="text-button"
            type="button"
            onClick={() => void loadVisits()}
          >
            Retry loading
          </button>
        </div>
      )}

      <section className="panel check-in-panel">
        <div className="section-heading">
          <div>
            <h2>Check in a visitor</h2>
            <p>Enter the visitor's details below.</p>
          </div>
        </div>

        <form onSubmit={handleCheckIn} noValidate>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="full_name">Visitor name *</label>
              <input
                id="full_name"
                name="full_name"
                value={form.full_name}
                onChange={(event) =>
                  handleFieldChange("full_name", event.target.value)
                }
                maxLength={100}
                required
                aria-invalid={Boolean(fieldErrors.full_name)}
                aria-describedby={
                  fieldErrors.full_name ? "full_name-error" : undefined
                }
                placeholder="e.g. Maria Santos"
              />
              {fieldErrors.full_name && (
                <p className="field-error" id="full_name-error">
                  {fieldErrors.full_name}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="company">Company (optional)</label>
              <input
                id="company"
                name="company"
                value={form.company}
                onChange={(event) =>
                  handleFieldChange("company", event.target.value)
                }
                maxLength={100}
                aria-invalid={Boolean(fieldErrors.company)}
                aria-describedby={
                  fieldErrors.company ? "company-error" : undefined
                }
                placeholder="e.g. ABC Solutions"
              />
              {fieldErrors.company && (
                <p className="field-error" id="company-error">
                  {fieldErrors.company}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="host_name">Person visiting *</label>
              <input
                id="host_name"
                name="host_name"
                value={form.host_name}
                onChange={(event) =>
                  handleFieldChange("host_name", event.target.value)
                }
                maxLength={100}
                required
                aria-invalid={Boolean(fieldErrors.host_name)}
                aria-describedby={
                  fieldErrors.host_name ? "host_name-error" : undefined
                }
                placeholder="e.g. John Reyes"
              />
              {fieldErrors.host_name && (
                <p className="field-error" id="host_name-error">
                  {fieldErrors.host_name}
                </p>
              )}
            </div>
          </div>

          <div className="form-actions">
            <p className="required-note">* Required fields</p>
            <button
              className="primary-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Checking in..." : "Check in visitor"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel visitors-panel">
        <div className="section-heading visitors-heading">
          <div>
            <h2>Today's visitors</h2>
            <p>
              {visits.length} {visits.length === 1 ? "visitor" : "visitors"} shown
            </p>
          </div>

          <div className="table-controls">
            <input
              className="search-input"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search visitor name..."
              aria-label="Search visitors by name"
            />

            <button
              className="secondary-button"
              type="button"
              onClick={() => void loadVisits()}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <p className="state-message">Loading today's visitors...</p>
        ) : visits.length === 0 ? (
          <p className="state-message">
            No visitors found for today.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Company</th>
                  <th>Person visiting</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr
                    key={visit.id}
                    className={
                      visit.checked_out_at === null
                        ? "visit-inside"
                        : undefined
                    }
                  >
                    <td className="visitor-name">{visit.full_name}</td>
                    <td>{visit.company || "—"}</td>
                    <td>{visit.host_name}</td>
                    <td>{formatDateTime(visit.checked_in_at)}</td>
                    <td>
                      {visit.checked_out_at
                        ? formatDateTime(visit.checked_out_at)
                        : <span className="status-inside">Still inside</span>}
                    </td>
                    <td>
                      {visit.checked_out_at === null ? (
                        <button
                          className="checkout-button"
                          type="button"
                          onClick={() => void handleCheckOut(visit.id)}
                          disabled={checkingOutId !== null}
                        >
                          {checkingOutId === visit.id
                            ? "Checking out..."
                            : "Check out"}
                        </button>
                      ) : (
                        <span className="completed-label">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="page-footer">
        Visitor Log · Internal visitor management
      </footer>
    </main>
  );
}

export default App;