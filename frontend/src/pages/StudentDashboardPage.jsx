import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import api from '../api/client.js'
import SectionCard from '../components/SectionCard.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { getErrorMessage } from '../utils/http.js'
import { parseSkills, stringifySkills } from '../utils/skills.js'

export default function StudentDashboardPage() {
  const [profileForm, setProfileForm] = useState({
    city: '',
    degree: '',
    email: '',
    experience_description: '',
    experience_title: '',
    field_of_study: '',
    internship_type: '',
    name: '',
    phone: '',
    preferred_location: '',
    preferredTechnologiesText: '',
    skillsText: '',
    university: '',
  })
  const [applications, setApplications] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [recommendationFilters, setRecommendationFilters] = useState({
    internshipType: '',
    location: '',
    skills: [],
  })
  const [cvFile, setCvFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [applyingOfferId, setApplyingOfferId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    setError('')

    try {
      const [profileResponse, recommendationResponse, applicationResponse] = await Promise.all([
        api.get('/profile'),
        api.get('/recommendations'),
        api.get('/applications'),
      ])

      const profile = profileResponse.data.data ?? profileResponse.data
      setProfileForm({
        city: profile.profile?.city ?? '',
        degree: profile.profile?.degree ?? '',
        email: profile.email ?? '',
        experience_description: profile.profile?.experience_description ?? '',
        experience_title: profile.profile?.experience_title ?? '',
        field_of_study: profile.profile?.field_of_study ?? '',
        internship_type: profile.profile?.internship_type ?? '',
        name: profile.name ?? '',
        phone: profile.profile?.phone ?? '',
        preferred_location: profile.profile?.preferred_location ?? '',
        preferredTechnologiesText: stringifySkills(profile.profile?.preferred_technologies ?? []),
        skillsText: stringifySkills(profile.profile?.skills ?? []),
        university: profile.profile?.university ?? '',
      })
      setRecommendations(recommendationResponse.data.data ?? [])
      setApplications(applicationResponse.data.data ?? [])
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load your dashboard.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('name', profileForm.name)
      formData.append('email', profileForm.email)
      formData.append('phone', profileForm.phone)
      formData.append('city', profileForm.city)
      formData.append('university', profileForm.university)
      formData.append('degree', profileForm.degree)
      formData.append('field_of_study', profileForm.field_of_study)
      formData.append('experience_title', profileForm.experience_title)
      formData.append('experience_description', profileForm.experience_description)
      formData.append('internship_type', profileForm.internship_type)
      formData.append('preferred_location', profileForm.preferred_location)
      parseSkills(profileForm.skillsText).forEach((skill, index) => formData.append(`skills[${index}]`, skill))
      parseSkills(profileForm.preferredTechnologiesText).forEach((skill, index) => formData.append(`preferred_technologies[${index}]`, skill))

      if (cvFile) {
        formData.append('cv', cvFile)
      }

      await api.post('/profile', formData)

      setMessage('Your student profile is up to date.')
      setCvFile(null)
      await loadDashboard()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to update your profile.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleApply(offerId) {
    setApplyingOfferId(offerId)
    setError('')
    setMessage('')

    try {
      await api.post('/apply', { offer_id: offerId })
      setMessage('Application submitted successfully.')
      await loadDashboard()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to submit your application.'))
    } finally {
      setApplyingOfferId(null)
    }
  }

  const acceptedApplications = applications.filter((application) => application.status === 'accepted').length
  const pendingApplications = applications.filter((application) => application.status === 'pending').length
  const skillCount = parseSkills(profileForm.skillsText).length
  const availableSkills = useMemo(() => {
    const skills = recommendations.flatMap((offer) => offer.required_skills ?? [])

    return [...new Set(skills.map((skill) => skill.trim()).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second))
  }, [recommendations])
  const filteredRecommendations = useMemo(() => {
    const selectedSkills = recommendationFilters.skills.map((skill) => skill.toLowerCase())
    const location = recommendationFilters.location.trim().toLowerCase()
    const internshipType = recommendationFilters.internshipType.trim().toLowerCase()

    return recommendations.filter((offer) => {
      const skills = (offer.required_skills ?? []).map((skill) => skill.toLowerCase())
      const offerLocation = (offer.location ?? '').toLowerCase()
      const offerType = (offer.internship_type ?? '').toLowerCase()

      return (!selectedSkills.length || selectedSkills.every((skill) => skills.includes(skill)))
        && (!location || offerLocation.includes(location))
        && (!internshipType || offerType === internshipType)
    })
  }, [recommendations, recommendationFilters])

  return (
    <div className="space-y-6">
      <section className="app-card fade-up rounded-3xl p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-sm font-extrabold text-blue-600">Student dashboard</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight text-slate-950">
              Your profile, recommendations, and applications in one workspace.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Keep your CV data structured so companies and the matcher can understand your strongest signals.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <Metric label="Skills" value={skillCount} />
            <Metric label="Pending" value={pendingApplications} />
            <Metric label="Accepted" value={acceptedApplications} />
          </div>
        </div>
      </section>

      {loading ? <Alert tone="neutral">Loading your workspace...</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}
      {message ? <Alert tone="success">{message}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard eyebrow="Profile" title="CV profile" subtitle="This is the structured data used for recommendations and company review.">
          <form className="space-y-5" onSubmit={handleSaveProfile}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="Name" value={profileForm.name} onChange={(value) => setProfileForm({ ...profileForm, name: value })} />
              <FormInput label="Email" type="email" value={profileForm.email} onChange={(value) => setProfileForm({ ...profileForm, email: value })} />
              <FormInput label="Phone" value={profileForm.phone} onChange={(value) => setProfileForm({ ...profileForm, phone: value })} />
              <FormInput label="City" value={profileForm.city} onChange={(value) => setProfileForm({ ...profileForm, city: value })} />
              <FormInput label="University" value={profileForm.university} onChange={(value) => setProfileForm({ ...profileForm, university: value })} />
              <FormInput label="Degree" value={profileForm.degree} onChange={(value) => setProfileForm({ ...profileForm, degree: value })} />
            </div>
            <FormInput label="Field of study" value={profileForm.field_of_study} onChange={(value) => setProfileForm({ ...profileForm, field_of_study: value })} />
            <FormTextarea label="Skills" value={profileForm.skillsText} onChange={(value) => setProfileForm({ ...profileForm, skillsText: value })} placeholder="python, sql, react" rows="3" />
            <FormTextarea label="Preferred technologies" value={profileForm.preferredTechnologiesText} onChange={(value) => setProfileForm({ ...profileForm, preferredTechnologiesText: value })} placeholder="laravel, react, ai" rows="2" />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="Internship type" value={profileForm.internship_type} onChange={(value) => setProfileForm({ ...profileForm, internship_type: value })} />
              <FormInput label="Preferred location" value={profileForm.preferred_location} onChange={(value) => setProfileForm({ ...profileForm, preferred_location: value })} />
            </div>
            <FormInput label="Experience title" value={profileForm.experience_title} onChange={(value) => setProfileForm({ ...profileForm, experience_title: value })} />
            <FormTextarea label="Experience description" value={profileForm.experience_description} onChange={(value) => setProfileForm({ ...profileForm, experience_description: value })} rows="3" />
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">CV upload (PDF)</span>
              <input className="form-field text-sm" type="file" accept="application/pdf" onChange={(event) => setCvFile(event.target.files?.[0] ?? null)} />
            </label>
            <button type="submit" disabled={saving} className="primary-button disabled:cursor-not-allowed disabled:opacity-70">
              {saving ? 'Saving profile...' : 'Save profile'}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          eyebrow="Recommendations"
          title="Best-fit internships"
          subtitle="Ranked by skill overlap between your profile and each offer's requirements."
          actions={<NavLink to="/applications" className="secondary-button">Application tracker</NavLink>}
        >
          <div className="mb-5 grid gap-3 lg:grid-cols-[1.1fr_0.95fr_0.95fr]">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Skills</span>
              <select
                className="form-field min-h-28"
                multiple
                value={recommendationFilters.skills}
                onChange={(event) => setRecommendationFilters({
                  ...recommendationFilters,
                  skills: Array.from(event.target.selectedOptions, (option) => option.value),
                })}
              >
                {availableSkills.map((skill) => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </label>
            <FormInput
              label="Location"
              value={recommendationFilters.location}
              onChange={(value) => setRecommendationFilters({ ...recommendationFilters, location: value })}
              placeholder="Casablanca, Rabat, Remote..."
            />
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Internship type</span>
              <select
                className="form-field"
                value={recommendationFilters.internshipType}
                onChange={(event) => setRecommendationFilters({ ...recommendationFilters, internshipType: event.target.value })}
              >
                <option value="">All types</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
              </select>
            </label>
          </div>
          {recommendationFilters.skills.length || recommendationFilters.location || recommendationFilters.internshipType ? (
            <button type="button" className="secondary-button mb-5" onClick={() => setRecommendationFilters({ internshipType: '', location: '', skills: [] })}>
              Clear filters
            </button>
          ) : null}
          <div className="grid gap-4">
            {loading ? <RecommendationSkeleton /> : null}
            {filteredRecommendations.map((offer) => (
              <article key={offer.id} className="soft-card rounded-2xl p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500">{offer.company?.company_name}</p>
                    <h3 className="mt-1 text-xl font-extrabold text-slate-950">{offer.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {offer.location ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{offer.location}</span> : null}
                      {offer.internship_type ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{offer.internship_type}</span> : null}
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{offer.description}</p>
                  </div>
                  <MatchBadge score={offer.match_score ?? 0} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(offer.required_skills ?? []).map((skill) => <span key={skill} className="skill-tag">{skill}</span>)}
                </div>
                <p className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">
                  Matched because: {(offer.matching_skills ?? []).join(', ') || 'No direct skill overlap yet'}
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">Matching skills: {(offer.matching_skills ?? []).join(', ') || 'No direct overlap detected yet.'}</p>
                  <button type="button" onClick={() => handleApply(offer.id)} disabled={applyingOfferId === offer.id} className="primary-button disabled:cursor-not-allowed disabled:opacity-60">
                    {applyingOfferId === offer.id ? 'Applying...' : 'Apply now'}
                  </button>
                </div>
              </article>
            ))}
            {!filteredRecommendations.length && !loading ? (
              <EmptyState text={recommendations.length ? 'No recommendations match your current filters.' : 'No recommendations yet. Add more skills to your profile to improve matching.'} />
            ) : null}
          </div>
        </SectionCard>
      </div>

      <SectionCard eyebrow="Recent activity" title="Application snapshot" subtitle="A quick view of your latest submitted applications.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? <ApplicationSkeleton /> : null}
          {applications.slice(0, 3).map((application) => (
            <article key={application.id} className="soft-card rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-950">{application.offer?.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{application.offer?.company_name}</p>
                </div>
                <StatusPill status={application.status} />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                {new Date(application.created_at).toLocaleDateString()}
              </p>
            </article>
          ))}
          {!applications.length && !loading ? <EmptyState text="No applications yet. Apply to one of your recommendations to get started." /> : null}
        </div>
      </SectionCard>
    </div>
  )
}

function MatchBadge({ score }) {
  const roundedScore = Math.round(score)
  const tone = roundedScore >= 80 ? 'green' : roundedScore >= 50 ? 'yellow' : 'red'
  const classes = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    red: 'border-rose-200 bg-rose-50 text-rose-800',
    yellow: 'border-amber-200 bg-amber-50 text-amber-800',
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 text-center ${classes[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.16em]">Match</p>
      <p className="mt-1 text-3xl font-extrabold">{roundedScore}%</p>
    </div>
  )
}

function RecommendationSkeleton() {
  return (
    <>
      {[0, 1].map((item) => (
        <div key={item} className="soft-card rounded-2xl p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="w-full space-y-3">
              <div className="skeleton h-4 w-36" />
              <div className="skeleton h-7 w-3/4" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
            </div>
            <div className="skeleton h-20 w-28 shrink-0" />
          </div>
        </div>
      ))}
    </>
  )
}

function ApplicationSkeleton() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <div key={item} className="soft-card rounded-2xl p-5">
          <div className="skeleton h-5 w-3/4" />
          <div className="skeleton mt-3 h-4 w-1/2" />
          <div className="skeleton mt-5 h-4 w-32" />
        </div>
      ))}
    </>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-950">{value}</p>
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

function FormTextarea({ label, value, onChange, placeholder, rows = '4' }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <textarea className="form-field resize-y" rows={rows} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}
