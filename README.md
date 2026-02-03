# TMS Frontend

React (Vite) frontend for the TMS (Transport Management System) app.

## Tech Stack

- **React**
- **React Router**
- **Apollo Client (GraphQL)**
- **Tailwind CSS**
- **Vite**

## Environment Variables

Create a `.env` file (not committed) and set:

- **`VITE_GRAPHQL_URL`**
  - Local: `http://localhost:3000/graphql`
  - Hosted example: `https://<your-backend-host>/graphql`

If not set, the app defaults to `http://localhost:3000/graphql`.

## Local Setup

```bash
yarn install
```

## Run

```bash
yarn dev
```

Then open the URL printed by Vite (usually `http://localhost:5173`).

## Login

Use the seeded backend users:

- **Admin**: `admin@tms.dev` / `admin123`
- **Employee**: `employee@tms.dev` / `employee123`
