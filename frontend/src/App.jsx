import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { useAuth } from './context/useAuth.js'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import ApplicationTrackingPage from './pages/ApplicationTrackingPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import CompanyDashboardPage from './pages/CompanyDashboardPage.jsx'
import InternshipDetailsPage from './pages/InternshipDetailsPage.jsx'
import InternshipListingsPage from './pages/InternshipListingsPage.jsx'
import StudentDashboardPage from './pages/StudentDashboardPage.jsx'
import { roleHomePath } from './utils/navigation.js'

function HomeRedirect() {
  const { bootstrapping, user } = useAuth()

  if (bootstrapping) {
    return <div className="mx-auto mt-24 max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center font-semibold text-slate-600 shadow-xl">Loading workspace...</div>
  }

  if (user) {
    return <Navigate replace to={roleHomePath(user.role)} />
  }

  return <Navigate replace to="/internships" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<Layout />}>
        <Route index element={<HomeRedirect />} />
        <Route path="/internships" element={<InternshipListingsPage />} />
        <Route path="/internships/:id" element={<InternshipDetailsPage />} />
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={['student']}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute roles={['student']}>
              <ApplicationTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company"
          element={
            <ProtectedRoute roles={['company']}>
              <CompanyDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
