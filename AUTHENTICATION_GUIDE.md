# Admin Dashboard Authentication System

## Overview
Complete authentication system with login, protected routes, and session management for the PW Admin Dashboard.

## Features Implemented

### 1. **Login Component** (`src/components/Login.jsx`)
- ✅ Beautiful gradient UI with animations
- ✅ Email and password validation
- ✅ Show/hide password toggle
- ✅ Remember me checkbox
- ✅ Loading states with spinner
- ✅ Error handling and display
- ✅ Responsive design
- ✅ API integration with backend

### 2. **Authentication Context** (`src/context/AuthContext.jsx`)
- ✅ Global authentication state management
- ✅ User data persistence
- ✅ Token management
- ✅ Auto-authentication on app load
- ✅ Login/Logout functions
- ✅ Auth status checking

### 3. **Protected Routes** (`src/components/PrivateRoute.jsx`)
- ✅ Route protection middleware
- ✅ Automatic redirect to login
- ✅ Loading state handling
- ✅ Seamless user experience

### 4. **Updated App Router** (`src/App.jsx`)
- ✅ AuthProvider wrapper
- ✅ Login route
- ✅ All dashboard routes protected
- ✅ Root redirect based on auth status
- ✅ 404 handling

### 5. **Enhanced Sidebar** (`src/components/Sidebar.jsx`)
- ✅ User profile display
- ✅ Functional logout button
- ✅ Logout confirmation
- ✅ User name and email display

## API Integration

### Backend Endpoints Used
```javascript
POST /api/admin/login
- Body: { email, password }
- Returns: { success, message, data: { admin, token } }

GET /api/admin/me
- Headers: Authorization: Bearer <token>
- Returns: { success, data: admin }
```

### Token Management
- Token stored in localStorage as `pw_admin_token`
- User data stored as `pw_admin_user`
- Automatically sent with all authenticated requests
- Cleared on logout

## Usage

### 1. Login Flow
```javascript
// User enters credentials
// System validates input
// Calls authAPI.login(email, password)
// On success:
//   - Token saved to localStorage
//   - User data saved to localStorage
//   - Redirect to /dashboard
// On failure:
//   - Show error message
```

### 2. Protected Route Access
```javascript
// User tries to access /dashboard
// PrivateRoute checks authentication
// If authenticated:
//   - Allow access
// If not authenticated:
//   - Redirect to /login
```

### 3. Logout Flow
```javascript
// User clicks logout button
// Confirmation dialog shown
// On confirm:
//   - Clear token from localStorage
//   - Clear user data
//   - Update auth context
//   - Redirect to /login
```

## Components API

### useAuth Hook
```javascript
import { useAuth } from '../context/AuthContext'

const { user, loading, isAuthenticated, login, logout, checkAuth } = useAuth()

// user - Current user object { id, name, email, phone, role }
// loading - Boolean indicating auth check in progress
// isAuthenticated - Boolean indicating if user is logged in
// login(email, password) - Login function
// logout() - Logout function
// checkAuth() - Re-check authentication status
```

### Login Component Props
```javascript
// No props required - self-contained component
<Login />
```

### PrivateRoute Component
```javascript
// Wrap any protected component
<PrivateRoute>
  <YourProtectedComponent />
</PrivateRoute>
```

## Styling

### Custom CSS Classes
- `bg-grid-pattern` - Animated grid background
- `animate-bounce-slow` - Slow bounce animation for logo
- `custom-scrollbar` - Styled scrollbars

### Color Scheme
- Primary: Indigo (600-900)
- Secondary: Purple (500-700)
- Accent: Pink (500)
- Success: Green
- Error: Red

## Security Features

1. **Token-based Authentication**
   - JWT tokens for secure communication
   - Token expiry handling
   - Automatic token refresh capability

2. **Input Validation**
   - Email format validation
   - Password presence check
   - XSS protection via React

3. **Protected Routes**
   - All admin routes require authentication
   - Automatic redirect for unauthorized access
   - Session persistence across page reloads

4. **Secure Storage**
   - LocalStorage for token persistence
   - Cleared on logout
   - No sensitive data in plain text

## Testing Credentials

Create an admin account using your backend:
```bash
POST /api/admin/register
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "your-password",
  "phone": "+1234567890"
}
```

Then login with:
- Email: admin@example.com
- Password: your-password

## Environment Variables

Ensure your `.env` file has:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Troubleshooting

### Issue: "Cannot read property 'user' of undefined"
**Solution:** Ensure component is wrapped in `<AuthProvider>`

### Issue: Infinite redirect loop
**Solution:** Check token validity and clear localStorage if corrupted

### Issue: 401 Unauthorized errors
**Solution:** Token may be expired. Logout and login again.

### Issue: Login button doesn't work
**Solution:** Check backend server is running and API_BASE_URL is correct

## Future Enhancements

- [ ] Forgot password functionality
- [ ] Two-factor authentication (2FA)
- [ ] Password strength indicator
- [ ] Session timeout warning
- [ ] Remember me persistence
- [ ] Social login integration
- [ ] Rate limiting on login attempts
- [ ] Login history tracking

## File Structure
```
admindashboard/
├── src/
│   ├── components/
│   │   ├── Login.jsx              # Login UI component
│   │   ├── PrivateRoute.jsx       # Route protection
│   │   └── Sidebar.jsx            # Updated with logout
│   ├── context/
│   │   └── AuthContext.jsx        # Auth state management
│   ├── services/
│   │   ├── api.js                 # API endpoints
│   │   └── apiClient.js           # HTTP client
│   ├── App.jsx                    # Updated with auth routes
│   └── index.css                  # Custom styles
└── AUTHENTICATION_GUIDE.md        # This file
```

## Support

For issues or questions, contact your system administrator.

---
**Last Updated:** November 2024
**Version:** 1.0.0

