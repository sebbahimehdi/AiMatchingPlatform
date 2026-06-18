import { NavLink, Outlet } from 'react-router-dom'
import logoIcon from '../assets/ai-internship-matcher-icon.svg'
import { useAuth } from '../context/useAuth.js'
import { roleHomePath } from '../utils/navigation.js'

const baseLinks = [{ label: 'Internships', to: '/internships' }]

export default function Layout() {
  const { logout, user } = useAuth()
  const roleLinks = user?.role === 'student'
    ? [
        { label: 'Student Dashboard', to: '/student' },
        { label: 'Applications', to: '/applications' },
      ]
    : user?.role === 'company'
      ? [{ label: 'Company Dashboard', to: '/company' }]
      : user?.role === 'admin'
        ? [{ label: 'Admin Dashboard', to: '/admin' }]
        : []

  const links = [...baseLinks, ...roleLinks]

  return (
    <div className="page-shell text-slate-900">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 lg:block">
          <NavLink to="/" className="flex items-center gap-3">
            <img src={logoIcon} alt="AI Internship Matcher" className="h-12 w-12 shrink-0" />
            <span>
              <span className="block text-base font-extrabold text-slate-950">AI Internship Matcher</span>
              <span className="text-xs font-semibold text-slate-500">Hiring intelligence</span>
            </span>
          </NavLink>

          <nav className="mt-8 space-y-1">
            {links.map((item) => (
              <SidebarLink key={item.to} item={item} />
            ))}
          </nav>

          <div className="absolute bottom-6 left-5 right-5 rounded-2xl bg-blue-50 p-4">
            <p className="text-sm font-bold text-blue-950">{user ? user.name : 'Build your profile'}</p>
            <p className="mt-1 text-xs leading-5 text-blue-700">
              {user ? `${user.role} workspace` : 'Create a profile and start matching with internships.'}
            </p>
            {user ? (
              <button type="button" onClick={logout} className="mt-3 text-sm font-bold text-blue-700 hover:text-blue-900">
                Log out
              </button>
            ) : (
              <NavLink to="/auth" className="mt-3 inline-flex text-sm font-bold text-blue-700 hover:text-blue-900">
                Sign in
              </NavLink>
            )}
          </div>
        </aside>

        <div className="min-w-0 flex-1 lg:pl-72">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <img src={logoIcon} alt="" className="h-10 w-10 shrink-0 lg:hidden" />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">AI Internship Matcher</p>
                  <h1 className="truncate text-lg font-extrabold text-slate-950 sm:text-xl">
                    {user ? `Welcome back, ${user.name}` : 'Discover internships matched to your skills'}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 md:flex">
                  {links.map((item) => (
                    <TopLink key={item.to} item={item} />
                  ))}
                </div>
                {user ? (
                  <NavLink to={roleHomePath(user.role)} className="hidden rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 sm:inline-flex">
                    {user.role}
                  </NavLink>
                ) : (
                  <NavLink to="/auth" className="primary-button px-4 py-2 text-sm">
                    Sign in
                  </NavLink>
                )}
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

function SidebarLink({ item }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center rounded-xl px-4 py-3 text-sm font-bold transition ${
          isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
        }`
      }
    >
      {item.label}
    </NavLink>
  )
}

function TopLink({ item }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `rounded-full px-3 py-2 text-sm font-bold transition ${
          isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      {item.label}
    </NavLink>
  )
}
