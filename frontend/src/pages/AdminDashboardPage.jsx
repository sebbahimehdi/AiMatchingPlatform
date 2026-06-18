import { useEffect, useState } from 'react'
import api from '../api/client.js'
import SectionCard from '../components/SectionCard.jsx'
import { getErrorMessage } from '../utils/http.js'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadAdminWorkspace()
  }, [])

  async function loadAdminWorkspace() {
    setLoading(true)
    setError('')

    try {
      const [statsResponse, usersResponse, offersResponse] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/offers'),
      ])

      setStats(statsResponse.data.data)
      setUsers(usersResponse.data.data ?? [])
      setOffers(offersResponse.data.data ?? [])
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load the admin dashboard.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleUserUpdate(userId, payload, successMessage) {
    setError('')
    setMessage('')

    try {
      await api.patch(`/admin/users/${userId}`, payload)
      setMessage(successMessage)
      await loadAdminWorkspace()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to update that user.'))
    }
  }

  async function handleUserDelete(userId) {
    setError('')
    setMessage('')

    try {
      await api.delete(`/admin/users/${userId}`)
      setMessage('User deleted successfully.')
      await loadAdminWorkspace()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to delete that user.'))
    }
  }

  async function handleOfferDelete(offerId) {
    setError('')
    setMessage('')

    try {
      await api.delete(`/admin/offers/${offerId}`)
      setMessage('Offer deleted successfully.')
      await loadAdminWorkspace()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to delete that offer.'))
    }
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel fade-up rounded-[32px] border border-white/10 p-8 shadow-[0_25px_80px_rgba(8,15,30,0.45)] sm:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Admin oversight</p>
        <h2 className="mt-4 text-4xl font-bold text-white">Platform health, moderation, and offer governance in one view.</h2>
        <p className="mt-5 max-w-3xl text-slate-300">
          Keep the marketplace trustworthy by managing users, reviewing published internships, and tracking how healthy the application funnel looks across the system.
        </p>
      </section>

      {loading ? <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">Loading admin workspace...</div> : null}
      {error ? <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Users', stats?.total_users ?? 0],
          ['Offers', stats?.offers ?? 0],
          ['Applications', stats?.applications ?? 0],
          ['Average match', `${Math.round(stats?.average_match_score ?? 0)}%`],
        ].map(([label, value]) => (
          <div key={label} className="glass-panel rounded-[28px] border border-white/10 p-6 shadow-[0_24px_70px_rgba(7,14,28,0.4)]">
            <p className="text-sm text-slate-300">{label}</p>
            <p className="mt-3 text-4xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <SectionCard
          eyebrow="User moderation"
          title="Manage users"
          subtitle="Ban disruptive accounts, adjust roles, or remove stale records."
        >
          <div className="grid gap-4">
            {users.map((user) => (
              <article key={user.id} className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                    <p className="mt-2 text-sm text-slate-300">{user.email}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-cyan-200/70">{user.role}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${user.is_banned ? 'border-rose-300/30 bg-rose-400/10 text-rose-100' : 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100'}`}>
                    {user.is_banned ? 'Banned' : 'Active'}
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleUserUpdate(user.id, { is_banned: !user.is_banned }, user.is_banned ? 'User reinstated.' : 'User banned.')}
                    className="rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-100 transition hover:border-amber-300/60"
                  >
                    {user.is_banned ? 'Unban' : 'Ban'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUserDelete(user.id)}
                    className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm text-rose-100 transition hover:border-rose-300/60"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Offer moderation"
          title="Manage internship offers"
          subtitle="Remove stale or inappropriate postings and keep the marketplace clean."
        >
          <div className="grid gap-4">
            {offers.map((offer) => (
              <article key={offer.id} className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{offer.title}</h3>
                    <p className="mt-2 text-sm uppercase tracking-[0.22em] text-cyan-200/70">{offer.company?.company_name}</p>
                    <p className="mt-3 text-sm text-slate-300">{offer.description}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Applicants</p>
                    <p className="mt-1 text-3xl font-bold text-white">{offer.applications_count ?? 0}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(offer.required_skills ?? []).map((skill) => (
                    <span key={skill} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-100">
                      {skill}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleOfferDelete(offer.id)}
                  className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm text-rose-100 transition hover:border-rose-300/60"
                >
                  Delete offer
                </button>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
