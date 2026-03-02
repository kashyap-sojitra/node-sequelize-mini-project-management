# 🚀 ProjectFlow

A modern, full-stack project management system with Kanban boards, drag-and-drop tasks, team collaboration, and real-time dashboards.

---

## Monorepo Setup

This project uses a **Turborepo monorepo** structure to manage both backend and frontend apps efficiently:

- **Root**: Contains `package.json` (npm workspaces), `turbo.json` (pipeline config), and shared config files.
- **backend/**: Node.js + Express + Sequelize REST API (MySQL)
- **frontend/**: Next.js (React, TypeScript, Tailwind CSS)

### Key Features of the Monorepo
- Unified dependency management and scripts via npm workspaces
- Fast builds, linting, and dev with [Turborepo](https://turbo.build/)
- Shared caching for builds and tasks
- One git repository for all code

### How it works
- Run `npm install` from the root to install all dependencies for both apps
- Use `npm run dev`, `npm run build`, `npm run lint` from the root to run tasks across all packages
- All changes are tracked in a single git repository (no nested repos)

---

## Tech Stack

### Frontend
- Next.js (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Axios
- @hello-pangea/dnd (Kanban)
- react-hot-toast
- react-icons

### Backend
- Node.js 18+
- Express 4
- MySQL 8+
- Sequelize 6
- JWT, bcryptjs, express-validator, cors

---

### Backend .env

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=projectflow
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

You should see:

```
✅ Database connection established successfully.
✅ Database models synchronized.
🚀 Server running on port 5000
```

### 4. Frontend .env

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend development server:


## License

MIT License

Copyright (c) 2026 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<p align="center">
  <sub>Built with ❤️ using Next.js, Express, and MySQL</sub><br />
  <sub>⭐ Star this repo if you found it helpful!</sub>
</p>
