import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import api from '../api/client.js'
import SectionCard from '../components/SectionCard.jsx'
import { useAuth } from '../context/useAuth.js'
import { getErrorMessage } from '../utils/http.js'

export default function InternshipListingsPage() {
  const { user } = useAuth()
  const [offers, setOffers] = useState([])
  const [query, setQuery] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOffers() {
      try {
        const { data } = await api.get('/offers')
        setOffers(data.data ?? [])
      } catch (requestError) {
        setError(getErrorMessage(requestError, 'Unable to load internships right now.'))
      } finally {
        setLoading(false)
      }
    }

    loadOffers()
  }, [])

  const filteredOffers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const normalizedSkill = skillFilter.trim().toLowerCase()

    return offers.filter((offer) => {
      const haystack = `${offer.title} ${offer.description} ${offer.location ?? ''} ${offer.internship_type ?? ''} ${offer.company?.company_name ?? ''}`.toLowerCase()
      const skills = offer.required_skills ?? []

      return (!normalizedQuery || haystack.includes(normalizedQuery))
        && (!normalizedSkill || skills.some((skill) => skill.toLowerCase().includes(normalizedSkill)))
    })
  }, [offers, query, skillFilter])

  return (
    <div className="space-y-6">
      <section className="app-card fade-up overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <p className="text-sm font-extrabold text-blue-600">Live internship board</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl">
              Explore internships from companies hiring emerging talent.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Search by role, company, or technology. Students can open details, review skill requirements, and apply from a focused workspace.
            </p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-5">
            <p className="text-sm font-bold text-blue-800">Open internships</p>
            <p className="mt-2 text-5xl font-extrabold text-blue-950">{offers.length}</p>
            <NavLink to={user ? '/student' : '/auth'} className="primary-button mt-5 w-full">
              {user?.role === 'student' ? 'Open recommendations' : 'Join the platform'}
            </NavLink>
          </div>
        </div>
      </section>

      <SectionCard
        eyebrow="Find a role"
        title="Internship listings"
        subtitle="Every listing is structured around skills so the matching score is transparent."
      >
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_18rem]">
          <input className="form-field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, company, or description" />
          <input className="form-field" value={skillFilter} onChange={(event) => setSkillFilter(event.target.value)} placeholder="Filter by skill" />
        </div>

        {loading ? <p className="text-slate-500">Loading internships...</p> : null}
        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}

        <div className="grid gap-4">
          {filteredOffers.map((offer) => (
            <article key={offer.id} className="soft-card rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-500">{offer.company?.company_name ?? 'Company'}</p>
                  <h3 className="mt-1 text-2xl font-extrabold text-slate-950">{offer.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {offer.location ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{offer.location}</span> : null}
                    {offer.internship_type ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{offer.internship_type}</span> : null}
                  </div>
                  <p className="mt-3 line-clamp-3 max-w-3xl text-sm leading-6 text-slate-600">{offer.description}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                  <NavLink to={`/internships/${offer.id}`} className="primary-button">
                    View details
                  </NavLink>
                  <span className="rounded-xl bg-slate-100 px-3 py-2 text-center text-xs font-bold text-slate-500">
                    {new Date(offer.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {(offer.required_skills ?? []).map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
          {!loading && !filteredOffers.length ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              No internships match your current filters.
            </div>
          ) : null}
        </div>
      </SectionCard>
    </div>
  )
}
