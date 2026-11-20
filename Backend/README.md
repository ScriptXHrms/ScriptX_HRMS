# ScriptX HRMS

Three separate projects, one folder each:

| Folder | What it is | Local URL |
| --- | --- | --- |
| `Backend` | Node.js, Express, MongoDB API | <http://localhost:5000> |
| `Admin` | Admin Portal (React, Tailwind CSS, GSAP) | <http://localhost:5173> |
| `Employee` | Employee Portal (React, Tailwind CSS, GSAP) | <http://localhost:5174> |

Admin and Employee each have their own copy of the shared UI code, so a change to a shared component has to be made in both.

## Run it locally

You need Node.js 20+ and a MongoDB database. Put its address in `MONGO_URI` in `Backend/.env`; `Backend/.env.example` lists every setting.

Run `npm install` once in each folder. Then use one terminal per folder:

```bash
cd Backend
npm run dev
```

```bash
cd Admin
npm run dev
```

```bash
cd Employee
npm run dev
```

A `502 Bad Gateway` on `/api/...` means the Backend isn't running. Admin and Employee use fixed ports and stop with a clear message if theirs is taken.

The two portals keep separate sessions, so you can be signed in to both in one browser.

## First-time setup

```bash
cd Backend
npm run setup -- admin@company.com StrongPassword
```

This adds the first admin, settings, leave types and policies. It only adds what is missing, so it is safe on any database. It doesn't create employees: sign in to Admin, add departments, roles and shifts, then add employees.

To try HR access, open Privileges in Admin and pick an employee. They sign in to Admin with their own login and only see the modules they were given.

For a full set of demo data, point `MONGO_URI` at a local database and run `npm run seed`. It wipes that database first, so it refuses to run against anything but localhost. Demo logins are `admin@demo.com` / `Admin@123` and `employee@demo.com` / `Employee@123`.

Without SMTP settings, password reset codes are printed in the Backend console.

## Deploy

Run `npm run build` in Admin and in Employee. Then in Backend set `NODE_ENV=production`, a real `MONGO_URI`, new `JWT_SECRET` and `DATA_KEY` values, and `COOKIE_SECURE=true` behind HTTPS, and run `npm start`.

The Backend serves both builds, Admin at `/admin` and Employee at `/employee`, so one process and one domain cover everything.

## Layout

```text
Admin/src/pages, Employee/src/pages     Pages for that portal
Admin/src/features, Employee/src/...    Larger features (tasks, calendar, leave, daily reports)
Admin/src/components, Employee/src/...  UI building blocks
Admin/src/lib/animate.js                GSAP helpers (reduced motion is respected)
Admin/src/config/navigation.js          Sidebar menu and the privilege each item needs
Backend/src/routes                      API routes
Backend/src/models/index.js             Database models
Backend/src/utils                       Attendance, payroll and leave rules
```
