# SnapVault

SnapVault is a progressive web app that functions as a disposable camera event platform for capturing, sharing, and revealing memories with a nostalgic touch. The app allows users to create events, take photos with vintage filters, and share them with event participants.

## Features

- **Event Creation**: Create events with customizable photo limits and reveal delays
- **QR Code Sharing**: Share events with others via QR codes
- **Vintage Filters**: Apply retro filters (sepia, grainy, black & white, etc.) to photos
- **Delayed Reveal**: Photos remain hidden until a specified time has passed
- **User Registration**: Event participants can register with their name
- **Host Recognition**: Event creators are automatically recognized as hosts

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: SQLite with Drizzle ORM
- **Camera**: React Webcam

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

## License

This project is licensed under the MIT License - see the LICENSE file for details. 