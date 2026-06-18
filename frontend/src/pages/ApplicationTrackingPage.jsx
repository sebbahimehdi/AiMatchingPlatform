import { useEffect, useState } from 'react'
import api from '../api/client.js'
import SectionCard from '../components/SectionCard.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { getErrorMessage } from '../utils/http.js'

export default function ApplicationTrackingPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadApplications() {
      try {
        const { data } = await api.get('/applications')
        setApplications(data.data ?? [])
      } catch (requestError) {
        setError(getErrorMessage(requestError, 'Unable to load your applications.'))
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [])

  return (
    <div className="space-y-6">
      <section className="app-card rounded-3xl p-6 sm:p-8">
        <p className="text-sm font-extrabold text-blue-600">Application tracker</p>
        <h2 className="mt-3 text-4xl font-extrabold text-slate-950">Track every internship application.</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Follow submissions, review statuses, and keep your internship search organized.
        </p>
      </section>

      <SectionCard eyebrow="Student workflow" title="Applications" subtitle="Recent submissions and current review status.">
        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
        <div className="grid gap-4">
          {loading ? <ApplicationTrackerSkeleton /> : null}
          {applications.map((application) => (
            <article key={application.id} className="soft-card rounded-2xl p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-950">{application.offer?.title}</h3>
                  <p className="mt-2 text-sm font-medium text-slate-500">{application.offer?.company_name}</p>
                </div>
                <StatusPill status={application.status} />
              </div>
              <p className="mt-4 text-sm text-slate-500">Submitted on {new Date(application.created_at).toLocaleString()}</p>
            </article>
          ))}
          {!loading && !applications.length ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">
              No applications yet. Head to the internship listings or your recommendations and submit your first one.
            </div>
          ) : null}
        </div>
      </SectionCard>
    </div>
  )
}

function ApplicationTrackerSkeleton() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <div key={item} className="soft-card rounded-2xl p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full space-y-3">
              <div className="skeleton h-6 w-72 max-w-full" />
              <div className="skeleton h-4 w-44" />
            </div>
            <div className="skeleton h-8 w-24" />
          </div>
          <div className="skeleton mt-5 h-4 w-56" />
        </div>
      ))}
    </>
  )
}
