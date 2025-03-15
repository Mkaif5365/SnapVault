# SnapVault

SnapVault is a progressive web app that functions as a disposable camera event platform for capturing, sharing, and revealing memories with a nostalgic touch. The app allows users to create events, take photos with vintage filters, and share them with event participants.

## Features

- **Event Creation**: Create events with customizable photo limits and reveal delays
- **QR Code Sharing**: Share events with others via QR codes
- **Vintage Filters**: Apply retro filters (sepia, grainy, black & white, etc.) to photos
- **Delayed Reveal**: Photos remain hidden until a specified time has passed
- **User Authentication**: Full login/signup system for creating and managing events
- **User Dashboard**: View and manage all your created events in one place
- **Host Recognition**: Event creators are automatically recognized as hosts with special privileges
- **Contact Form**: Easy way for users to get in touch with support
- **Responsive Design**: Optimized for both desktop and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express
- **Database**: SQLite with Drizzle ORM
- **Authentication**: JWT-based authentication system
- **Camera**: React Webcam
- **UI Components**: Shadcn/UI

## Pages

- **Home**: Landing page with features, testimonials, and demo section
- **Login/Signup**: User authentication pages
- **Dashboard**: View and manage your events
- **Event Creation**: Create new events with customizable settings
- **Event Details**: View event details, photos, and participants
- **Camera**: Take photos with vintage filters
- **Privacy Policy**: Detailed information about data handling
- **Terms of Service**: User agreement and terms
- **Contact**: Form to get in touch with support

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/snapvault.git
   cd snapvault
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5000`

## Mobile Testing

To test the app on a mobile device:

1. Make sure your mobile device is on the same network as your development machine
2. Find your local IP address (e.g., 192.168.1.x)
3. Access the app on your mobile device by navigating to `http://your-local-ip:5000`

## Database Migrations

The app uses SQLite with automatic migrations:

```
npm run db:push
```

## Authentication

The app uses JWT-based authentication:

1. Users can sign up with email and password
2. Login generates a JWT token stored in localStorage
3. Protected routes require authentication
4. Event hosts have special privileges

## License

This project is licensed under the MIT License - see the LICENSE file for details. 