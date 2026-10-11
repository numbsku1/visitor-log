
const express = require("express");
const pool = require("./db");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

// GET /api/visits?q=ann
// Return today's visitors, newest check-in first.
app.get("/api/visits", async (req, res) => {
  try {
    const q =
      typeof req.query.q === "string"
        ? req.query.q.trim()
        : "";

    const result = await pool.query(
      `SELECT
         id,
         full_name,
         company,
         host_name,
         checked_in_at,
         checked_out_at
       FROM visits
       WHERE checked_in_at >= CURRENT_DATE
         AND checked_in_at < CURRENT_DATE + INTERVAL '1 day'
         AND full_name ILIKE '%' || $1 || '%'
       ORDER BY checked_in_at DESC`,
      [q]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching visits:", error);
    res.status(500).json({
      message: "An unexpected error occurred.",
    });
  }
});

// POST /api/visits
// Check a visitor in.
app.post("/api/visits", async (req, res) => {
  const body = req.body;
  const errors = {};

  const fullName =
    typeof body?.full_name === "string"
      ? body.full_name.trim()
      : "";

  const hostName =
    typeof body?.host_name === "string"
      ? body.host_name.trim()
      : "";

  const company =
    typeof body?.company === "string"
      ? body.company.trim()
      : "";

  if (!fullName) {
    errors.full_name = "Visitor name is required.";
  } else if (fullName.length > 100) {
    errors.full_name =
      "Visitor name must be 100 characters or fewer.";
  }

  if (body?.company != null && typeof body.company !== "string") {
    errors.company = "Company must be text.";
  } else if (company.length > 100) {
    errors.company =
      "Company must be 100 characters or fewer.";
  }

  if (!hostName) {
    errors.host_name = "Person visiting is required.";
  } else if (hostName.length > 100) {
    errors.host_name =
      "Person visiting must be 100 characters or fewer.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const result = await pool.query(
      `INSERT INTO visits (full_name, company, host_name)
       VALUES ($1, $2, $3)
       RETURNING
         id,
         full_name,
         company,
         host_name,
         checked_in_at,
         checked_out_at`,
      [fullName, company || null, hostName]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error checking visitor in:", error);
    res.status(500).json({
      message: "An unexpected error occurred.",
    });
  }
});

// PATCH /api/visits/:id/check-out
// Check a visitor out only if they are still inside.
app.patch("/api/visits/:id/check-out", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(404).json({
      message: "Visit not found.",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE visits
       SET checked_out_at = NOW()
       WHERE id = $1
         AND checked_out_at IS NULL
       RETURNING
         id,
         full_name,
         company,
         host_name,
         checked_in_at,
         checked_out_at`,
      [id]
    );

    if (result.rowCount > 0) {
      return res.status(200).json(result.rows[0]);
    }

    const existingVisit = await pool.query(
      `SELECT id, checked_out_at
       FROM visits
       WHERE id = $1`,
      [id]
    );

    if (existingVisit.rows.length === 0) {
      return res.status(404).json({
        message: "Visit not found.",
      });
    }

    return res.status(409).json({
      message: "This visitor has already checked out.",
    });
  } catch (error) {
    console.error("Error checking visitor out:", error);
    res.status(500).json({
      message: "An unexpected error occurred.",
    });
  }
});

// Return JSON for malformed JSON request bodies.
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      message: "Invalid JSON request body.",
    });
  }

  console.error("Unexpected server error:", error);
  return res.status(500).json({
    message: "An unexpected error occurred.",
  });
});

app.listen(PORT, () => {
  console.log(`Visitor Log API running on http://localhost:${PORT}`);
});