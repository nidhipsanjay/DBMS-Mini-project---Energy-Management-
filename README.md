# Energy Management DBMS (React + Express + MySQL)

A lightweight web GUI and API for managing energy plants, production, distribution, regions, employees and reports. This repository contains a React frontend (`src/`) and a Node/Express backend (`backend/`) which connects to a MySQL database.

**Status:** Working prototype — backend runs from `backend/server.js` and frontend is a React app started from the repo root.

**Tech stack:**
- **Frontend:** React (Create React App)
- **Backend:** Node.js + Express
- **Database:** MySQL (using `mysql2`)

**Quick Links:**
- Frontend entry: `src/index.js`, `src/App.jsx`
- Backend entry: `backend/server.js`

**Important:** The sample backend currently contains inline MySQL credentials in `backend/server.js`. Do not use these credentials in production. Instead use environment variables or a secrets manager and add the credentials file to `.gitignore`.
 

**Requirements**
- Node.js (v16+ recommended)
- npm
- MySQL server (create a database named `EnergyManagement` or update config)

**Setup & Run (Windows PowerShell)**

1. Install frontend dependencies (root project):

```powershell
npm install
```

2. Install backend dependencies:

```powershell
cd backend; npm install
```

3. Configure the database:
- Create a MySQL database named `EnergyManagement` or update the database name in `backend/server.js`.
- Recommended: move credentials into a `.env` and reference them from `server.js` (example below).

4. Start the backend:

```powershell
cd backend
# either
node server.js
# or, if you prefer npm scripts, create a `start` script in `backend/package.json` and run `npm start`
```

5. Start the frontend (from repo root):

```powershell
npm start
```

Open the React app at `http://localhost:3000` (default CRA port). The backend listens on port `5000` by default.

Then update `backend/server.js` to read these with `process.env.*` (use `dotenv` package).

**API Endpoints**
- Generic CRUD endpoints generated in `server.js`:
  - `GET /api/energytypes`, `POST /api/energytypes`, `PUT /api/energytypes/:id`, `DELETE /api/energytypes/:id`
  - `regions`, `plants`, `production`, `distribution`, `employees`
- Utility endpoints:
  - `GET /api/total-salary/:plantID`
  - `POST /api/add-employee-procedure`
  - `GET /api/employee/details/:empID`
  - `GET /api/avg-production/:plantID`
  - `GET /api/region-summary/:regionID`
  - `GET /api/overall-report`
  - `GET /api/energy-summary/:energyTypeID`
  - `GET /api/report/aggregate`
  - `POST /api/login`

See `backend/server.js` for implementation details and SQL used.

**Project Structure**
- `backend/server.js` — Express server and all API routes
- `backend/package.json` — backend dependencies
- `src/` — React frontend sources
  - `src/components` — React UI components (CRUD views, charts, login, navbar, etc.)
- `public/index.html` — front-end HTML

**Security & Notes**
- Remove or secure hardcoded credentials in `backend/server.js` before sharing or deploying.
- Use prepared statements or parameterized queries (the project uses `mysql2` and parameterization in some routes; verify for all queries).
- Add input validation and authentication for production-ready deployment.

