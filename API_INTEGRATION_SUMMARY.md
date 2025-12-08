# Admin Dashboard API Integration Summary

## ✅ Completed Components

### 1. **API Services** (`src/services/api.js`)
- Created comprehensive API service functions for all endpoints:
  - Authentication (admin login, get me)
  - Admin Management (CRUD operations)
  - Courses (CRUD + featured/popular/category filters)
  - Batches (CRUD + statistics)
  - Instructors (CRUD)
  - Centres (CRUD + nearby search)
  - Classes (CRUD + live classes)
  - Enrollments (CRUD + progress tracking)
  - Orders (CRUD + cancel)
  - Store (CRUD + stock management)
  - Tests (CRUD + publish)

### 2. **Dashboard Component**
- ✅ Fetches real statistics from APIs:
  - Total Instructors
  - Active Batches
  - Total Courses
  - Total Revenue (from orders)
  - Total Enrollments
- ✅ Loading states and error handling
- ✅ Charts remain static (can be enhanced with time-series data later)

### 3. **Courses Component**
- ✅ Full CRUD operations
- ✅ Image upload support (multipart/form-data)
- ✅ Search and category filtering
- ✅ Loading states, error handling
- ✅ Form validation

### 4. **Admins Component**
- ✅ Full CRUD operations
- ✅ Status toggle (activate/deactivate)
- ✅ Role-based UI (Super Admin vs Admin)
- ✅ Loading states, error handling

### 5. **Batches Component**
- ✅ Full CRUD operations
- ✅ Search functionality
- ✅ Status management
- ✅ Loading states, error handling

### 6. **Instructors Component**
- ✅ Full CRUD operations
- ✅ Search functionality
- ✅ Loading states, error handling

## 📋 Remaining Components (Follow Same Pattern)

The following components need similar updates. Use the same pattern as Courses/Admins/Batches:

### Pattern to Follow:
1. **Import API services and utilities:**
```javascript
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { [entity]API } from '../services/api'
import StateMessage from './StateMessage'
```

2. **Add state management:**
```javascript
const [loading, setLoading] = useState(true)
const [submitting, setSubmitting] = useState(false)
const [error, setError] = useState(null)
const [data, setData] = useState([])
```

3. **Add fetch function:**
```javascript
const fetchData = async () => {
  try {
    setLoading(true)
    setError(null)
    const response = await [entity]API.getAll()
    const data = response.data?.data || response.data || []
    setData(Array.isArray(data) ? data : [])
  } catch (err) {
    setError(err.message || 'Failed to load data')
    setData([])
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  fetchData()
}, [])
```

4. **Add CRUD handlers:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    setSubmitting(true)
    setError(null)
    if (editingItem) {
      await [entity]API.update(editingItem._id || editingItem.id, formData)
    } else {
      await [entity]API.create(formData)
    }
    handleCloseModal()
    fetchData()
  } catch (err) {
    setError(err.message || 'Failed to save')
  } finally {
    setSubmitting(false)
  }
}

const handleDelete = async (id) => {
  if (!window.confirm('Are you sure?')) return
  try {
    await [entity]API.delete(id)
    fetchData()
  } catch (err) {
    setError(err.message || 'Failed to delete')
  }
}
```

5. **Add loading/error UI:**
```javascript
{error && (
  <StateMessage
    title="Error"
    message={error}
    variant="error"
    onAction={() => setError(null)}
  />
)}

{loading ? (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="animate-spin text-indigo-600" size={48} />
  </div>
) : (
  <>
    {/* Your content here */}
  </>
)}
```

### Components to Update:

1. **Centres** (`src/components/Centres.jsx`)
   - Use `centresAPI` from services
   - Add CRUD operations
   - Implement nearby search if needed

2. **Classes** (`src/components/Classes.jsx`)
   - Use `classesAPI` from services
   - Add CRUD operations
   - Show live classes

3. **Enrollments** (`src/components/Enrollments.jsx`)
   - Use `enrollmentsAPI` from services
   - Add CRUD operations
   - Progress tracking

4. **Orders** (`src/components/Orders.jsx`)
   - Use `ordersAPI` from services
   - Add CRUD operations
   - Cancel order functionality

5. **Store** (`src/components/Store.jsx`)
   - Use `storeAPI` from services
   - Add CRUD operations
   - Stock management

6. **Tests** (`src/components/Tests.jsx`)
   - Use `testsAPI` from services
   - Add CRUD operations
   - Publish functionality

7. **Students** (`src/components/Students.jsx`)
   - May need user API endpoints
   - List and manage students

## 🔧 Configuration

### Environment Variables
Make sure to set in `.env` or `.env.local`:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Authentication
The API client automatically handles authentication tokens:
- Admin tokens stored in localStorage as `pw_admin_token`
- Tokens sent in Authorization header: `Bearer {token}`

## 📝 Notes

1. **API Response Format**: The code handles both response formats:
   - `response.data.data` (nested)
   - `response.data` (direct)

2. **Error Handling**: All components use `StateMessage` for consistent error display

3. **Loading States**: All components show loading spinners during data fetch

4. **Form Validation**: Client-side validation is in place; server-side validation errors are displayed

5. **File Uploads**: Courses component demonstrates multipart/form-data handling for images

## 🚀 Next Steps

1. Update remaining components following the pattern above
2. Add pagination if needed (API supports page/limit params)
3. Add filtering and sorting where applicable
4. Enhance Dashboard with real-time data and charts
5. Add authentication check/redirect if not logged in
6. Add toast notifications for success messages

