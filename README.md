# Visitor Log System

A full-stack visitor log application built with React, TypeScript, Express, and PostgreSQL. The system allows staff to register visitors, view today's visitor records, search by visitor name, and check visitors out.

## Features

* Register visitors with name, company, and person being visited.
* Validate required fields and character limits on both the frontend and backend.
* Display today's visitors, with the newest check-ins first.
* Highlight visitors who are still inside.
* Check out visitors and prevent duplicate check-outs.
* Search today's visitors by name using case-insensitive partial matching.
* Display loading, empty, and error states.
* Use parameterized SQL queries to help protect against SQL injection.

## Technology Stack

* **Frontend:** React, Vite, TypeScript
* **Backend:** Node.js, Express
* **Database:** PostgreSQL
* **Database driver:** `pg`

## Project Structure

```text
visitor-log/
├── backend/
│   ├── .env.example
│   ├── db.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── schema.sql
├── seed.sql
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the application:

* Node.js and npm
* PostgreSQL
* A code editor, such as Visual Studio Code

## Setup Instructions

### 1. Create the database

Open PostgreSQL and create a database named `visitor_log_db`.

For example, using `psql`:

```sql
CREATE DATABASE visitor_log_db;
```

Connect to the database:

```sql
\c visitor_log_db
```

### 2. Create the database table

From the project root, run:

```powershell
psql -U postgres -d visitor_log_db -f schema.sql
```

Enter your PostgreSQL password if prompted.

### 3. Insert sample data

Run:

```powershell
psql -U postgres -d visitor_log_db -f seed.sql
```

The seed script inserts sample visitor records, including visitors who have already checked out.

**Note:** Run `seed.sql` only once for this database unless you intentionally want to add the sample records again.

### 4. Configure the backend

Open a terminal in the `backend` directory:

```powershell
cd backend
```

Create your local `.env` file by copying `.env.example`:

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and configure the PostgreSQL connection settings:

```text
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=visitor_log_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

Replace `your_postgres_password` with your own PostgreSQL password.

**Security:** Do not commit the actual `.env` file to Git.

Install backend dependencies:

```powershell
npm install
```

Start the backend development server:

```powershell
npm run dev
```

The API should be available at `http://localhost:3000`.

Keep this terminal running.

### 5. Start the frontend

Open a second terminal and navigate to the frontend directory:

```powershell
cd frontend
```

Install frontend dependencies:

```powershell
npm install
```

Start the Vite development server:

```powershell
npm run dev
```

Open the local URL printed in the terminal, typically `http://localhost:5173`.

Keep both the backend and frontend servers running while using the application.

## API Endpoints

| Method | Endpoint                    | Description                     |
| ------ | --------------------------- | ------------------------------- |
| POST   | `/api/visits`               | Register a new visitor          |
| GET    | `/api/visits`               | Retrieve today's visitors       |
| GET    | `/api/visits?q=Maria`       | Search today's visitors by name |
| PATCH  | `/api/visits/:id/check-out` | Check out a visitor             |

### API Response and Error Handling

* **200 OK:** Request completed successfully.
* **201 Created:** Visitor registered successfully.
* **400 Bad Request:** Invalid input or malformed JSON.
* **404 Not Found:** Visitor ID does not exist.
* **409 Conflict:** Visitor has already checked out.
* **500 Internal Server Error:** Unexpected server error.

The visitor name and person being visited are required and must contain 1–100 characters after trimming. The company field is optional and may contain up to 100 characters.

## Basic Demo Checklist

1. Register a visitor with a name, company, and person being visited.
2. Confirm that the visitor appears in today's table without refreshing the page.
3. Search for a visitor by entering part of their name.
4. Check out a visitor and confirm that the checkout time appears.
5. Attempt to check out the same visitor again and confirm that the application reports an error.
6. Try submitting the form with a required field left blank and confirm that validation appears.

## Notes

* The application uses PostgreSQL to persist visitor records.
* Search is performed by the backend using a parameterized SQL query.
* Visitor records are ordered from newest to oldest.
* Authentication, role management, historical reports, pagination, and deployment are outside the current project scope.
