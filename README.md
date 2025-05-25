# Ephra Health App

A React Native mobile application for health tracking, emotional journaling, and coach appointment scheduling.

## Features

- **Integrated Calendar**: View and manage your health journey with a comprehensive calendar
- **Emotional Journal**: Track your moods, add notes, and upload photos to document your health journey
- **Appointment Scheduling**: Book and manage sessions with your health coach
- **Content Sharing**: Control which journal entries and health data are shared with your coach
- **Google Authentication**: Secure login with Google account integration

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **State Management**: React Context API
- **Navigation**: React Navigation
- **UI Components**: Custom components with consistent styling

## Project Structure

```bash
ephra/
├── app/                      # Main application code
│   ├── assets/               # Images, fonts, etc.
│   ├── components/           # Reusable UI components
│   │   ├── calendar/         # Calendar components
│   │   ├── journal/          # Journal components
│   │   └── StripeProvider.tsx # Stripe payment provider
│   ├── contexts/             # React context providers
│   │   └── AuthContext.tsx   # Authentication context
│   ├── config/               # App configuration
│   │   └── env.ts            # Environment configuration
│   ├── hooks/                # Custom React hooks
│   │   └── useAuth.ts        # Authentication hook
│   ├── navigation/           # Navigation configuration
│   │   └── AppNavigator.tsx  # Main navigation setup
│   ├── screens/              # App screens
│   │   ├── appointments/     # Appointment booking screens
│   │   ├── auth/             # Authentication screens
│   │   ├── calendar/         # Calendar screens
│   │   ├── coach/            # Coach-related screens
│   │   ├── journal/          # Journal screens
│   │   └── profile/          # User profile screens
│   └── services/             # API and service integrations
│       ├── firebase/         # Firebase service functions
│       ├── googleCalendarService.ts # Google Calendar integration
│       └── stripeService.ts  # Stripe payment integration
├── assets/                   # Global assets
└── [Configuration files]     # Various configuration files
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- Firebase account
- Docker and Docker Compose (for development container)
- VS Code with Remote - Containers extension (for development container)

### Installation

#### Option 1: Local Development

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/ephra.git
   cd ephra
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables

   - Create a `.env.local` file at the root of the project
   - Fill in your Firebase configuration values
   - Add any other required API keys

   ```bash
   # Create a .env.local file with the following variables
   # (see Environment Variables section below for details)
   touch .env.local
   # Then edit .env.local with your actual values
   ```

4. Configure Firebase

   - Create a Firebase project
   - Enable Authentication (Email/Password and Google)
   - Set up Firestore database
   - Set up Storage

5. Start the development server

   ```bash
   npm start
   # or
   yarn start
   ```

6. Run on a device or emulator
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan the QR code with the Expo Go app on your physical device

#### Option 2: Development Container (Recommended)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

2. Install [VS Code](https://code.visualstudio.com/) and the [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

3. Clone the repository

   ```bash
   git clone https://github.com/yourusername/ephra.git
   cd ephra
   ```

4. Open the project in VS Code

   ```bash
   code .
   ```

5. When prompted, click "Reopen in Container" or run the command:

   - Press `F1` and select "Remote-Containers: Reopen in Container"

6. VS Code will build the development container (this may take a few minutes the first time)

7. Once inside the container, the project dependencies will be automatically installed

8. Set up environment variables and configure Firebase as described in Option 1, steps 3-4

9. Start the development server

   ```bash
   npm start
   # or
   yarn start
   ```

10. Access the application:
    - Web version: [http://localhost:19006](http://localhost:19006)
    - Use Expo Go app on your physical device by scanning the QR code
    - For iOS/Android emulators, additional configuration may be needed

## Environment Configuration

This project uses a comprehensive environment configuration system to manage different deployment environments and service integrations.

### Quick Setup

```bash
# Interactive environment setup
npm run setup:env

# Or choose specific environment
npm run setup:dev      # Development
npm run setup:staging  # Staging
npm run setup:prod     # Production
```

### Validate Configuration

```bash
# Check current environment
npm run env:validate

# Show environment info
npm run env:show

# Test API connection
npm run test:api
```

### Key Environment Variables

```env
# Environment
APP_ENV=development                    # development, staging, production
API_BASE_URL=http://localhost:8000/v1  # Backend API endpoint
DEBUG=true                             # Enable debug logging

# Feature Flags
FEATURE_STRIPE_PAYMENTS=true           # Enable payments
FEATURE_GOOGLE_CALENDAR=true           # Enable calendar
FEATURE_PUSH_NOTIFICATIONS=true        # Enable notifications

# Third-party Services
STRIPE_PUBLISHABLE_KEY=pk_test_...     # Stripe payment key
GOOGLE_API_KEY=your_google_api_key     # Google services
```

For complete configuration options, see [Environment Configuration Guide](./docs/ENVIRONMENT_CONFIGURATION.md).

## Color Scheme

- Primary color: Deep green (#4CAF50) for a sense of calm and nature
- Secondary color: Pastel yellow (#FFF9C4) for warmth and optimism
- Accent: Deep blue (#3F51B5) for interactive elements and highlights

## License

[MIT License](LICENSE)
