<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Takk Arena

Gamified sales tracking and competition platform for sales teams.

## Features

- 📊 **Dashboard** - Real-time sales tracking and wage calculations
- ⚔️ **Battles** - 1v1 and team competitions with live scoring
- 🏆 **Leaderboards** - Daily, weekly, and monthly rankings
- 💬 **Messaging** - Team communication with taunts and challenges
- 🤖 **AI Coach** - Powered by Gemini for personalized advice
- 📱 **PWA** - Installable on mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Realtime DB)
- **AI**: Google Gemini API
- **Build**: Vite

## Architecture

```
├── components/          # React components
│   ├── Competitions/    # Battle and competition features
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication
│   ├── useBattles.ts   # Battle management
│   ├── useSalesData.ts # Data subscriptions
│   └── ...
├── services/           # Firebase service layer
│   ├── salesService.ts
│   ├── battleService.ts
│   └── ...
├── utils/              # Utility functions
└── types.ts            # TypeScript definitions
```

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in `.env`:
   ```
   GEMINI_API_KEY=your_api_key
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173

## Testing

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage
```

## Deployment

### Netlify
The app includes `netlify.toml` for automatic deployment.

### Railway
Use `npm run build` to create production build.

## Security

- Firebase Security Rules in `firestore.rules`
- Admin access controlled via `useAdminCheck` hook
- Sensitive operations protected by role checks

## License

Private - Takk ehf.
