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
│   ├── screens/              # App screens
│   ├── navigation/           # Navigation configuration
│   ├── services/             # API and service integrations
│   ├── hooks/                # Custom React hooks
│   ├── contexts/             # React context providers
│   ├── utils/                # Utility functions
│   └── config/               # App configuration
├── firebase/                 # Firebase configuration
└── [Other config files]      # Various configuration files
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
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase configuration values
   - Add any other required API keys

   ```bash
   cp .env.example .env.local
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

5. Run on a device or emulator
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

## Environment Variables

This project uses environment variables to manage sensitive information like API keys. The following variables are required:

### Firebase Configuration

```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.region.firebasedatabase.app
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Stripe Configuration

```env
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

### Google API Configuration

```env
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

These variables should be placed in a `.env.local` file at the root of the project. For development, you can copy the `.env.example` file and fill in your values.

## Color Scheme

- Primary color: Deep green (#4CAF50) for a sense of calm and nature
- Secondary color: Pastel yellow (#FFF9C4) for warmth and optimism
- Accent: Deep blue (#3F51B5) for interactive elements and highlights

## License

[MIT License](LICENSE)
