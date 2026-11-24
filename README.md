# VΛLOR PUBG Esports

A Next.js app for the VΛLOR PUBG esports community: black-and-gold landing page, accounts, member roster, community chat, news, merchandise catalog, and role-protected control room.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
cp .env.example .env
# Set a private, random AUTH_SECRET (32+ characters) and the account email that should own the site.
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Register with the email in `OWNER_EMAIL` to create the initial Owner account. All other new accounts are Members. The Owner can promote/demote Members and Moderators to Admin or Moderator. Admins can view the control room but cannot change roles. Owner accounts are protected from role changes. Never commit `.env` or use the development fallback secret in production.

Discord: https://discord.gg/X9ddrR5huU  
Tournaments: https://bigplay.gg/en

## Database

Prisma + SQLite for local development. Tables: User, NewsPost, Product, Message, AuditLog; roles are OWNER > ADMIN > MODERATOR > MEMBER. For production, configure a persistent database and migrate the Prisma datasource accordingly.
