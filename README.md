# Motion

A dark-first fitness app with Momentum Meter scoring, AI-powered form coaching, social circles, and progress tracking.

## Features

- **Momentum Meter** - Daily consistency score (0-100) based on workout completion, volume, and streaks
- **AI Coach** - Real-time pose tracking with form feedback using MoveNet/BlazePose
- **Progress Tracking** - Body metrics, progress photos with overlay comparison
- **Social Circles** - Private groups for accountability and motivation
- **GPS Runs** - Track outdoor runs with Google Maps integration
- **Nutrition Scan** - Gemini Vision integration for food analysis

## Tech Stack

- **Mobile**: Expo (React Native) + TypeScript
- **State**: Zustand with persistence
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **ML/Vision**: TFLite pose models (MoveNet, BlazePose)
- **Maps**: Google Maps via react-native-maps

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Supabase account

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your credentials to .env

# Start development server
npm start
```

### Environment Variables

| Variable | Purpose |
| --- | --- |
| EXPO_PUBLIC_SUPABASE_URL | Supabase project URL |
| EXPO_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous key |
| EXPO_PUBLIC_GEMINI_KEY | Gemini 1.5 Flash API key for nutrition scans |
| EXPO_PUBLIC_APP_ENV | Environment (development/production) |

## Project Structure

```
motion-app/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab navigation screens
│   │   ├── today.tsx       # Home with Momentum Meter
│   │   ├── progress.tsx    # Progress tracking
│   │   ├── social.tsx      # Community & circles
│   │   ├── coach.tsx       # AI Form Coach
│   │   └── settings.tsx    # App settings
│   ├── onboarding/         # Onboarding & calibration
│   ├── forge/              # Workout modes & GPS runs
│   └── nutrition/          # Nutrition scanning
├── src/
│   ├── components/         # UI components
│   ├── lib/                # Theme, utilities
│   ├── state/              # Zustand stores
│   └── vision/             # Pose detection & form rules
├── supabase/
│   ├── migrations/         # Database schema
│   └── edge-functions/     # Serverless functions
└── assets/                 # Images, fonts
```

## Design System

### Colors (Dark Theme)

| Token | Value | Usage |
|-------|-------|-------|
| primary | #1E90FF | Primary actions, links |
| primaryGreen | #00FF7F | Success, positive metrics |
| accent | #FF6B35 | CTAs, highlights |
| background | #111111 | App background |
| card | #171717 | Card backgrounds |
| textPrimary | #FFFFFF | Primary text |
| textSecondary | #B8C2CC | Secondary text |

### Components

- `MotionButton` - Primary button with gradient/solid variants
- `MotionCard` - Container card with elevation options
- `MomentumMeter` - Circular progress for daily score

## AI Coach

Real-time pose estimation with form feedback:

1. **Capture** - Camera at 24-30fps
2. **Inference** - MoveNet/BlazePose extracts keypoints
3. **Analysis** - Rule engine evaluates joint angles
4. **Feedback** - Visual overlays and cues

### Supported Exercises

- Barbell Back Squat
- Conventional Deadlift
- Push-Up
- Bench Press
- Overhead Press

## License

MIT
