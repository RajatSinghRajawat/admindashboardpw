# Admin Dashboard - PW Platform

A comprehensive, industry-level admin dashboard for managing the PW educational platform.

## Features

- 🔐 **Authentication System** - Secure login with JWT tokens
- 📊 **Dashboard Overview** - Analytics, charts, and statistics
- 📚 **Course Management** - Full CRUD operations with image upload
- 👥 **User Management** - Admin user management
- ⚙️ **Settings** - Profile and system settings
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Modern UI** - Beautiful, professional interface

## Tech Stack

- **React 19** - UI library
- **React Router** - Navigation
- **Axios** - API client
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:5000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
admindashboard/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Layout.jsx    # Main layout with sidebar
│   │   └── ProtectedRoute.jsx
│   ├── context/          # React context providers
│   │   └── AuthContext.jsx
│   ├── pages/            # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Courses.jsx
│   │   ├── Users.jsx
│   │   └── Settings.jsx
│   ├── services/         # API services
│   │   └── api.js
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
└── package.json
```

## API Integration

The dashboard integrates with the following backend endpoints:

- `POST /api/admin/login` - Admin login
- `GET /api/admin/me` - Get current admin
- `GET /api/admin/list` - Get all admins
- `GET /api/courses` - Get all courses
- `POST /api/courses/createCourse` - Create course
- `PUT /api/courses/update/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

## Features in Detail

### Dashboard
- Real-time statistics (courses, students, revenue)
- Growth charts and analytics
- Recent activity feed

### Course Management
- List all courses with search and filter
- Create new courses with image upload
- Edit existing courses
- Delete courses
- Image and thumbnail upload support

### User Management
- View all admin users
- Activate/deactivate users
- Delete users
- Search functionality

### Settings
- Update profile information
- Change password
- System preferences

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:5000/api)

## License

MIT
