# Linkly - Workout Tracker

**Track. Share. Inspire.**

A modern workout tracking application that helps you connect with the gym community, share your workouts, and inspire others.

## Features

- 🏋️ **Workout Logging**: Track your exercises, sets, and workout duration
- 👥 **Group Sessions**: Start dual or group workout sessions with friends
- 📊 **Statistics**: View your workout streak, total workouts, and weekly progress
- 📱 **Social Feed**: Discover group workouts from the community
- 🔔 **Notifications**: Stay updated with session requests and acceptances
- 📥 **Download Templates**: Generate beautiful workout images to share on social media

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth.js v5
- **Database**: MongoDB
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)
- MongoDB cluster (MongoDB Atlas recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd workout-logger
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:
```env
MONGODB_URI=your-mongodb-connection-string
NEXTAUTH_SECRET=your-secret-key (run: node generate-secret.js)
NEXTAUTH_URL=http://localhost:3000
```

5. Generate a secret key:
```bash
node generate-secret.js
```
Copy the output and add it to `NEXTAUTH_SECRET` in `.env.local`.

6. Run the development server:
```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
workout-logger/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── feed/              # Community feed page
│   ├── history/           # Workout history page
│   ├── profile/           # User profile page
│   └── workout/           # Workout logging page
├── components/            # React components
│   ├── layout/            # Layout components (Navigation)
│   └── providers/         # Context providers
├── lib/                   # Utility functions
│   ├── db.ts             # Database connection
│   ├── db-schema.ts      # Database schema definitions
│   └── api.ts            # Client-side API utilities
└── types/                # TypeScript type definitions
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests
- `pnpm type-check` - Run TypeScript type checking

## CI/CD Pipeline

This project includes a GitHub Actions CI/CD pipeline that:

- ✅ Runs linter and type checks on every push
- ✅ Runs tests before deployment
- ✅ Automatically deploys to Vercel when pushing to `main` branch

See [CI_CD_SETUP.md](./CI_CD_SETUP.md) for detailed setup instructions.

## Production Deployment

### Automatic Deployment (Recommended)

The project is configured for automatic deployment to Vercel via GitHub Actions. Simply:

1. Push to the `main` branch
2. The CI/CD pipeline will automatically:
   - Run tests and checks
   - Build the application
   - Deploy to Vercel production

### Manual Deployment

### Environment Variables

Make sure to set the following environment variables in your production environment:

- `MONGODB_URI` - Your MongoDB connection string
- `NEXTAUTH_SECRET` - A secure random string (use `generate-secret.js`)
- `NEXTAUTH_URL` - Your production URL (e.g., `https://yourdomain.com`)

### Build for Production

```bash
pnpm build
pnpm start
```

### Recommended Platforms

- **Vercel** (Recommended for Next.js) - Configured with CI/CD
- **Netlify**
- **Railway**
- **Render**

## Security Features

- Password hashing with bcryptjs
- Secure session management with NextAuth.js
- Input validation on both client and server
- Security headers configured in `next.config.ts`
- Protected API routes with authentication

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue in the repository.

---

Built with ❤️ for the gym community
