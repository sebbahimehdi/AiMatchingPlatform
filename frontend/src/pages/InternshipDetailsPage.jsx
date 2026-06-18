import { useEffect, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import api from '../api/client.js'
import SectionCard from '../components/SectionCard.jsx'
import { useAuth } from '../context/useAuth.js'
import { getErrorMessage } from '../utils/http.js'

export default function InternshipDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [offer, setOffer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadOffer() {
      try {
        const { data } = await api.get('/offers')
        const selectedOffer = (data.data ?? []).find((item) => String(item.id) === String(id))
        setOffer(selectedOffer ?? null)
      } catch (requestError) {
        setError(getErrorMessage(requestError, 'Unable to load this internship.'))
      } finally {
        setLoading(false)
      }
    }

    loadOffer()
  }, [id])

  async function handleApply() {
    if (!user) {
      navigate('/auth')
      return
    }

    setApplying(true)
    setError('')
    setMessage('')

    try {
      await api.post('/apply', { offer_id: offer.id })
      setMessage('Application submitted successfully.')
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to submit your application.'))
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return <div className="app-card rounded-2xl p-6 text-slate-600">Loading internship details...</div>
  }

  if (!offer) {
    return (
      <SectionCard title="Internship not found" subtitle="This listing may have been removed or is no longer available.">
        <NavLink to="/internships" className="primary-button">Back to internships</NavLink>
      </SectionCard>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <SectionCard
        eyebrow={offer.company?.company_name ?? 'Company'}
        title={offer.title}
        subtitle={`Posted ${new Date(offer.created_at).toLocaleDateString()}`}
      >
        {error ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
        {message ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div> : null}
        <div className="mb-6 flex flex-wrap gap-2">
          {offer.location ? <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">{offer.location}</span> : null}
          {offer.internship_type ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">{offer.internship_type}</span> : null}
        </div>
        <div className="prose max-w-none">
          <h3 className="text-lg font-extrabold text-slate-950">About the internship</h3>
          <p className="mt-3 whitespace-pre-line leading-8 text-slate-600">{offer.description}</p>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-extrabold text-slate-950">Required skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(offer.required_skills ?? []).map((skill) => (
              <span key={skill} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      </SectionCard>

      <aside className="app-card h-fit rounded-2xl p-5">
        <p className="text-sm font-bold text-slate-500">Company</p>
        <h3 className="mt-1 text-xl font-extrabold text-slate-950">{offer.company?.company_name ?? 'Company'}</h3>
        <div className="mt-4 grid gap-2 text-sm font-bold text-slate-600">
          {offer.location ? <p>Location: {offer.location}</p> : null}
          {offer.internship_type ? <p>Type: {offer.internship_type}</p> : null}
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Review the skill tags and apply when your profile matches the requirements.
        </p>
        <button type="button" onClick={handleApply} disabled={applying || user?.role === 'company'} className="primary-button mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60">
          {applying ? 'Applying...' : user?.role === 'student' ? 'Apply now' : 'Sign in as student'}
        </button>
        <NavLink to="/internships" className="secondary-button mt-3 w-full">
          Back to listings
        </NavLink>
      </aside>
    </div>
  )
}
