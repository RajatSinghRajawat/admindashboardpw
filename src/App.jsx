import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Courses from './components/Courses'
import Batchs from './components/Batchs'
import Instructor from './components/Instructor'
import Centres from './components/Centres'
import Classes from './components/Classes'
import Students from './components/Students'
import StudentProfile from './components/StudentProfile'
import Enrollments from './components/Enrollments'
import Orders from './components/Orders'
import Store from './components/Store'
import Tests from './components/Tests'
import Admins from './components/Admins'
import BookDemo from './components/BookDemo'
import GetStarted from './components/GetStarted'


// Layout wrapper to conditionally show sidebar
const AppLayout = ({ children }) => {
  const location = useLocation()
  const isLoginPage = location.pathname === '/'

  // Login page - no sidebar
  if (isLoginPage) {
    return <>{children}</>
  }

  // Dashboard pages - with sidebar
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto custom-scrollbar lg:ml-64">
        {children}
      </main>
    </div>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* Login page (root) - without sidebar */}
          <Route path="/" element={<Login />} />

          {/* Dashboard pages - with sidebar */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/batches" element={<Batchs />} />
          <Route path="/instructors" element={<Instructor />} />
          <Route path="/centres" element={<Centres />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          <Route path="/enrollments" element={<Enrollments />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/store" element={<Store />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/admins" element={<Admins />} />
          <Route path="/bookdemo" element={<BookDemo />} />
          <Route path="/get-started" element={<GetStarted />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App