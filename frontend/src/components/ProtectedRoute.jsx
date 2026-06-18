import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { roleHomePath } from '../utils/navigation.js'

export default function ProtectedRoute({ children, roles }) {
  const { bootstrapping, user } = useAuth()

  if (bootstrapping) {
    return <div className="mx-auto mt-24 max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center font-semibold text-slate-600 shadow-xl">Loading secure workspace...</div>
  }

  if (!user) {
    return <Navigate replace to="/auth" />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate replace to={roleHomePath(user.role)} />
  }

  return children
}
