import { useEffect, useState } from 'react'
import api from '../api/client.js'
import SectionCard from '../components/SectionCard.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { getErrorMessage } from '../utils/http.js'
import { parseSkills, stringifySkills } from '../utils/skills.js'

const initialOfferForm = {
  description: '',
  internship_type: 'Hybrid',
  location: '',
  requiredSkillsText: '',
  title: '',
}

export default function CompanyDashboardPage() {
  const [profileForm, setProfileForm] = useState({
    company_name: '',
    description: '',
    email: '',
    name: '',
  })
  const [offerForm, setOfferForm] = useState(initialOfferForm)
  const [editingOfferId, setEditingOfferId] = useState(null)
  const [offers, setOffers] = useState([])
  const [applicants, setApplicants] = useState([])
  const [activeOffer, setActiveOffer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadCompanyWorkspace()
  }, [])

  async function loadCompanyWorkspace() {
    setLoading(true)
    setError('')

    try {
      const [profileResponse, offerResponse] = await Promise.all([
        api.get('/company/profile'),
        api.get('/company/offers'),
      ])

      const payload = profileResponse.data.data
      setProfileForm({
        company_name: payload.company?.company_name ?? '',
        description: payload.company?.description ?? '',
        email: payload.email ?? '',
        name: payload.name ?? '',
      })
      setOffers(offerResponse.data.data ?? [])
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load the company dashboard.'))
    } finally {
      setLoading(false)
    }
  }

  async function loadApplicants(offer) {
    setError('')

    try {
      const { data } = await api.get(`/company/applicants/${offer.id}`)
      setApplicants(data.data ?? [])
      setActiveOffer(offer)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load applicants for this offer.'))
    }
  }

  async function handleSaveProfile(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      await api.post('/company/profile', profileForm)
      setMessage('Company profile updated successfully.')
      await loadCompanyWorkspace()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to update the company profile.'))
    }
  }

  async function handleSaveOffer(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      const payload = {
        title: offerForm.title,
        description: offerForm.description,
        location: offerForm.location,
        internship_type: offerForm.internship_type,
        required_skills: parseSkills(offerForm.requiredSkillsText),
      }

      if (editingOfferId) {
        await api.put(`/company/offers/${editingOfferId}`, payload)
        setMessage('Offer updated successfully.')
      } else {
        await api.post('/company/offers', payload)
        setMessage('Offer published successfully.')
      }

      setOfferForm(initialOfferForm)
      setEditingOfferId(null)
      await loadCompanyWorkspace()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to save this internship offer.'))
    }
  }

  async function handleDeleteOffer(offerId) {
    setError('')
    setMessage('')

    try {
      await api.delete(`/company/offers/${offerId}`)
      if (activeOffer?.id === offerId) {
        setActiveOffer(null)
        setApplicants([])
      }
      setMessage('Offer deleted successfully.')
      await loadCompanyWorkspace()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to delete this offer.'))
    }
  }

  async function handleStatusChange(applicationId, status) {
    if (!activeOffer) return

    setError('')
    setMessage('')

    try {
      await api.patch(`/company/applicants/${activeOffer.id}/${applicationId}`, { status })
      setMessage(`Application marked as ${status}.`)
      await loadApplicants(activeOffer)
      await loadCompanyWorkspace()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to update the application status.'))
    }
  }

  async function handleOpenCv(application) {
    const cvEndpoint = application.student?.cv_download_url

    if (!cvEndpoint) return

    setError('')

    const cvWindow = window.open('', '_blank')

    try {
      const { data } = await api.get(cvEndpoint.replace(api.defaults.baseURL, ''), {
        responseType: 'blob',
      })
      const fileUrl = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      if (cvWindow) {
        cvWindow.location.href = fileUrl
      } else {
        window.location.href = fileUrl
      }
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60_000)
    } catch (requestError) {
      cvWindow?.close()
      setError(getErrorMessage(requestError, 'Unable to open this CV.'))
    }
  }

  function startEditingOffer(offer) {
    setEditingOfferId(offer.id)
    setOfferForm({
      description: offer.description ?? '',
      internship_type: offer.internship_type ?? 'Hybrid',
      location: offer.location ?? '',
      requiredSkillsText: stringifySkills(offer.required_skills ?? []),
      title: offer.title ?? '',
    })
  }

  return (
    <div className="space-y-6">
      <section className="app-card fade-up rounded-3xl p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-sm font-extrabold text-blue-600">Company dashboard</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight text-slate-950">
              Publish internships, manage candidates, and keep hiring organized.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Create clear skill-based offers so students understand the role and the matcher can surface better candidates.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <Metric label="Active offers" value={offers.length} />
            <Metric label="Applicants" value={applicants.length} />
            <Metric label="Profile" value={profileForm.company_name || 'Ready'} />
          </div>
        </div>
      </section>

      {loading ? <Alert tone="neutral">Loading company workspace...</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}
      {message ? <Alert tone="success">{message}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <SectionCard eyebrow="Profile" title="Company profile" subtitle="This is shown alongside your internship offers.">
          <form className="space-y-4" onSubmit={handleSaveProfile}>
            <FormInput label="Contact name" value={profileForm.name} onChange={(value) => setProfileForm({ ...profileForm, name: value })} />
            <FormInput label="Contact email" type="email" value={profileForm.email} onChange={(value) => setProfileForm({ ...profileForm, email: value })} />
            <FormInput label="Company name" value={profileForm.company_name} onChange={(value) => setProfileForm({ ...profileForm, company_name: value })} />
            <FormTextarea label="Description" value={profileForm.description} onChange={(value) => setProfileForm({ ...profileForm, description: value })} rows="5" />
            <button type="submit" className="primary-button">Save company profile</button>
          </form>
        </SectionCard>

        <SectionCard eyebrow="Offers" title={editingOfferId ? 'Edit internship offer' : 'Publish a new internship'} subtitle="Use precise required skills for transparent matching.">
          <form className="space-y-4" onSubmit={handleSaveOffer}>
            <FormInput label="Title" value={offerForm.title} onChange={(value) => setOfferForm({ ...offerForm, title: value })} placeholder="Machine Learning Internship" />
            <FormTextarea label="Description" value={offerForm.description} onChange={(value) => setOfferForm({ ...offerForm, description: value })} placeholder="Outline scope, mentorship, and expected outcomes." rows="5" />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="Location" value={offerForm.location} onChange={(value) => setOfferForm({ ...offerForm, location: value })} placeholder="Casablanca, Rabat, Remote..." />
              <FormSelect label="Internship type" value={offerForm.internship_type} onChange={(value) => setOfferForm({ ...offerForm, internship_type: value })} />
            </div>
            <FormTextarea label="Required skills" value={offerForm.requiredSkillsText} onChange={(value) => setOfferForm({ ...offerForm, requiredSkillsText: value })} placeholder="python, sql, tensorflow" rows="3" />
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="primary-button">{editingOfferId ? 'Update offer' : 'Publish offer'}</button>
              {editingOfferId ? (
                <button type="button" onClick={() => {
                  setEditingOfferId(null)
                  setOfferForm(initialOfferForm)
                }} className="secondary-button">
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
        <SectionCard eyebrow="Offer portfolio" title="Published internships" subtitle="Review, edit, and manage applicants for each listing.">
          <div className="grid gap-4">
            {offers.map((offer) => (
              <article key={offer.id} className="soft-card rounded-2xl p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-950">{offer.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {offer.location ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{offer.location}</span> : null}
                      {offer.internship_type ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{offer.internship_type}</span> : null}
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{offer.description}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 px-4 py-3 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Applicants</p>
                    <p className="mt-1 text-3xl font-extrabold text-blue-950">{offer.applications_count ?? 0}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(offer.required_skills ?? []).map((skill) => <span key={skill} className="skill-tag">{skill}</span>)}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => loadApplicants(offer)} className="primary-button">View applicants</button>
                  <button type="button" onClick={() => startEditingOffer(offer)} className="secondary-button">Edit</button>
                  <button type="button" onClick={() => handleDeleteOffer(offer.id)} className="secondary-button border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800">Delete</button>
                </div>
              </article>
            ))}
            {!offers.length ? <EmptyState text="No offers published yet. Create your first internship above." /> : null}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Applicant queue" title={activeOffer ? `Applicants for ${activeOffer.title}` : 'Select an offer to review applicants'} subtitle="Move candidates through the review pipeline.">
          <div className="grid gap-4">
            {loading ? <ApplicantSkeleton /> : null}
            {applicants.map((application) => (
              <article key={application.id} className="soft-card rounded-2xl p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-950">{application.student?.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{application.student?.email}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(application.student?.skills ?? []).map((skill) => <span key={skill} className="skill-tag">{skill}</span>)}
                    </div>
                  </div>
                  <StatusPill status={application.status} />
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => handleStatusChange(application.id, 'accepted')} className="secondary-button border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50">Accept</button>
                  <button type="button" onClick={() => handleStatusChange(application.id, 'rejected')} className="secondary-button border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50">Reject</button>
                  {application.student?.cv_url ? (
                    <button type="button" onClick={() => handleOpenCv(application)} className="secondary-button">Open CV</button>
                  ) : null}
                </div>
              </article>
            ))}
            {!applicants.length && !loading ? (
              <EmptyState text={activeOffer ? 'No applications yet.' : 'Pick an offer from the left to load its applicants.'} />
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

function ApplicantSkeleton() {
  return (
    <>
      {[0, 1].map((item) => (
        <div key={item} className="soft-card rounded-2xl p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="w-full space-y-3">
              <div className="skeleton h-6 w-48" />
              <div className="skeleton h-4 w-60" />
              <div className="skeleton h-7 w-72" />
            </div>
            <div className="skeleton h-8 w-24" />
          </div>
        </div>
      ))}
    </>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 break-words text-3xl font-extrabold text-slate-950">{value}</p>
    </div>
  )
}

function Alert({ children, tone }) {
  const classes = {
    neutral: 'border-slate-200 bg-white text-slate-600',
    error: 'border-rose-200 bg-rose-50 text-rose-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  }

  return <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${classes[tone]}`}>{children}</div>
}

function EmptyState({ text }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">{text}</div>
}

function FormInput({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input className="form-field" type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}

function FormSelect({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <select className="form-field" value={value} onChange={(event) => onChange(event.target.value)}>
        <option>Remote</option>
        <option>Hybrid</option>
        <option>On-site</option>
        <option>Full-time</option>
        <option>Part-time</option>
      </select>
    </label>
  )
}

function FormTextarea({ label, value, onChange, placeholder, rows = '4' }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <textarea className="form-field resize-y" rows={rows} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}
