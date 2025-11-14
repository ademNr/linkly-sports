# MongoDB Setup Guide

## Step 1: Get Your MongoDB Connection String

1. Go to your MongoDB Atlas dashboard (https://cloud.mongodb.com/)
2. Click on your cluster
3. Click "Connect"
4. Choose "Connect your application"
5. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`)

## Step 2: Update .env.local

Add this line to your `.env.local` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

Replace `username`, `password`, `cluster`, and `database` with your actual MongoDB credentials.

## Step 3: Install Dependencies

Run this command to install the new dependencies:

```bash
pnpm install
```

This will install:
- `mongodb` - MongoDB driver
- `bcryptjs` - Password hashing
- `@types/bcryptjs` - TypeScript types

## Step 4: Restart Your Server

After updating `.env.local`, restart your development server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
pnpm dev
```

## Step 5: Create Your First Account

1. Go to http://localhost:3000/auth/signup
2. Create an account with a username and password
3. Sign in at http://localhost:3000/auth/signin

## Notes

- The database will be created automatically when you first insert data
- Collections (`users`, `workout_sessions`) will be created automatically
- No need to run any migration scripts - MongoDB is schema-less!

