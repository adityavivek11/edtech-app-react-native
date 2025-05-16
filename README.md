# Auth App

A React Native application built with Expo and Supabase for authentication and course management.

## Features

- User authentication with Supabase
- Course listing and management
- Secure storage for authentication tokens
- Pull-to-refresh functionality
- Modern UI with responsive design

## Tech Stack

- React Native
- Expo
- Supabase
- TypeScript
- Expo Router

## Setup

1. Clone the repository
```bash
git clone [your-repository-url]
```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
Create a `.env` file with your Supabase credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
   ```bash
    npx expo start
   ```

## Building for Production

### Android
```bash
npx expo prebuild --clean
cd android
./gradlew assembleRelease
```

## Environment Setup

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Security

- Uses SecureStore for sensitive data
- Implements PKCE flow for authentication
- Secure session management

## License

Private - All rights reserved
