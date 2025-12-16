# CronOps Frontend

A modern, responsive web application for managing cron jobs built with Next.js 16, React 19, and Tailwind CSS 4.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)

## Features

- 🔐 **Authentication** - Secure login/signup with OTP email verification
- 📊 **Dashboard** - Real-time overview of jobs, executions, and success rates
- ⏰ **Job Management** - Create, edit, pause, resume, and delete cron jobs
- 📝 **Execution Logs** - Detailed logs with filtering and pagination
- 👤 **User Settings** - Profile management and password updates
- 🌙 **Dark Mode** - Beautiful dark theme support
- 📱 **Responsive** - Mobile-first design that works on all devices
- ✨ **Animations** - Smooth transitions with Framer Motion

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Utilities**: [date-fns](https://date-fns.org/)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Dashboard page
│   ├── jobs/               # Job management pages
│   │   ├── [id]/           # Job details & edit
│   │   └── new/            # Create new job
│   ├── logs/               # Execution logs page
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── verify/             # OTP verification page
│   ├── settings/           # User settings page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── layout/             # Layout components
│   │   ├── dashboard-layout.tsx
│   │   └── navbar.tsx
│   └── ui/                 # Reusable UI components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── tabs.tsx
│       ├── toast.tsx
│       └── ...
└── lib/
    ├── api.ts              # API client & endpoints
    ├── store.ts            # Zustand state management
    └── utils.ts            # Utility functions
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/) 1.0+
- Backend server running on `http://localhost:3001`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CronOps/frontend
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install

   # Using bun (recommended)
   bun install
   ```

3. **Start the development server**
   ```bash
   # Using npm
   npm run dev

   # Using bun
   bun run dev
   ```

4. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |

## Environment Configuration

The frontend connects to the backend API at `http://localhost:3001` by default. To change this, update the `baseURL` in `src/lib/api.ts`:

```typescript
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Change this URL
  // ...
});
```

## Pages Overview

### Public Pages
- **`/`** - Landing page with features overview
- **`/login`** - User login
- **`/signup`** - User registration
- **`/verify`** - OTP email verification

### Protected Pages (requires authentication)
- **`/dashboard`** - Overview with stats, recent jobs, and executions
- **`/jobs`** - List all cron jobs with search and filtering
- **`/jobs/new`** - Create a new cron job
- **`/jobs/[id]`** - View job details and execution history
- **`/jobs/[id]/edit`** - Edit an existing job
- **`/logs`** - View all execution logs with filtering
- **`/settings`** - User profile and password management

## API Integration

The frontend communicates with the backend through RESTful APIs:

```typescript
// Authentication
authApi.login({ email, password })
authApi.register({ name, email, password })
authApi.verifyOTP({ email, otp })
authApi.resendOTP({ email })

// Jobs
jobsApi.getAll({ page, limit, status, search })
jobsApi.getById(id)
jobsApi.create(jobData)
jobsApi.update(id, jobData)
jobsApi.delete(id)
jobsApi.pause(id)
jobsApi.resume(id)
jobsApi.run(id)

// Logs
logsApi.getAll({ page, limit, status, jobId })
logsApi.getByJobId(jobId)

// Stats
statsApi.getStats()
```

## UI Components

The project uses a custom component library built on Radix UI primitives:

- **Button** - Primary, secondary, outline, ghost, destructive variants
- **Card** - Content containers with header, content, footer
- **Dialog** - Modal dialogs for confirmations
- **DropdownMenu** - Context menus and user dropdowns
- **Input** - Form inputs with validation states
- **Select** - Custom select dropdowns
- **Badge** - Status indicators with color variants
- **Toast** - Notification system
- **Tabs** - Tabbed navigation

## Styling

The project uses Tailwind CSS 4 with custom configuration:

- Custom color palette with indigo/purple accents
- Dark mode support via `dark:` variants
- Gradient backgrounds using `bg-linear-to-*`
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
