import { startTransition, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import logoIcon from '../assets/ai-internship-matcher-icon.svg'
import { useAuth } from '../context/useAuth.js'
import { getErrorMessage } from '../utils/http.js'
import { roleHomePath } from '../utils/navigation.js'

const initialLogin = { email: '', password: '' }
const initialRegister = {
  city: '',
  company_name: '',
  degree: '',
  description: '',
  email: '',
  experience_description: '',
  experience_title: '',
  field_of_study: '',
  full_name: '',
  internship_type: 'Hybrid',
  location: '',
  password: '',
  password_confirmation: '',
  phone: '',
  preferredTechInput: '',
  role: 'student',
  skillInput: '',
  skills: [],
  technologies: [],
  university: '',
  cv: null,
}

const studentSteps = [
  { title: 'Basic Information', hint: 'Account and contact details' },
  { title: 'Education', hint: 'Academic background' },
  { title: 'Skills', hint: 'Matching keywords' },
  { title: 'Experience', hint: 'Optional profile context' },
  { title: 'CV Upload', hint: 'Attach your PDF resume' },
  { title: 'Preferences', hint: 'Your ideal internship' },
]

const requiredByStep = [
  ['full_name', 'email', 'password', 'password_confirmation', 'phone', 'city'],
  ['university', 'degree', 'field_of_study'],
  ['skills'],
  [],
  [],
  ['technologies', 'internship_type', 'location'],
]

export default function AuthPage() {
  const navigate = useNavigate()
  const { register, login, user } = useAuth()
  const [mode, setMode] = useState('login')
  const [loginForm, setLoginForm] = useState(initialLogin)
  const [registerForm, setRegisterForm] = useState(initialRegister)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const completion = useMemo(() => Math.round(((step + 1) / studentSteps.length) * 100), [step])

  if (user) {
    return <Navigate replace to={roleHomePath(user.role)} />
  }

  async function handleLogin(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const signedInUser = await login(loginForm)
      startTransition(() => navigate(roleHomePath(signedInUser.role)))
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to sign in right now.'))
    } finally {
      setLoading(false)
    }
  }

  function updateRegister(field, value) {
    setRegisterForm((current) => ({ ...current, [field]: value }))
  }

  function addTag(inputField, targetField) {
    const value = registerForm[inputField].trim().toLowerCase()

    if (!value || registerForm[targetField].includes(value)) {
      updateRegister(inputField, '')
      return
    }

    setRegisterForm((current) => ({
      ...current,
      [inputField]: '',
      [targetField]: [...current[targetField], value],
    }))
  }

  function removeTag(targetField, tag) {
    setRegisterForm((current) => ({
      ...current,
      [targetField]: current[targetField].filter((item) => item !== tag),
    }))
  }

  function validateStudentStep(targetStep = step) {
    const missing = requiredByStep[targetStep].some((field) => {
      const value = registerForm[field]
      return Array.isArray(value) ? value.length === 0 : !String(value ?? '').trim()
    })

    if (missing) {
      setError('Complete the required fields before continuing.')
      return false
    }

    if (targetStep === 0 && registerForm.password !== registerForm.password_confirmation) {
      setError('Password confirmation does not match.')
      return false
    }

    setError('')
    return true
  }

  function goNext() {
    if (validateStudentStep()) {
      setStep((current) => Math.min(current + 1, studentSteps.length - 1))
    }
  }

  function appendFormArray(formData, field, values) {
    values.forEach((value, index) => {
      formData.append(`${field}[${index}]`, value)
    })
  }

  async function handleRegister(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      let payload = {
        name: registerForm.full_name,
        email: registerForm.email,
        password: registerForm.password,
        password_confirmation: registerForm.password_confirmation,
        role: registerForm.role,
        description: registerForm.role === 'company' ? registerForm.description : undefined,
        company_name: registerForm.role === 'company' ? registerForm.company_name : undefined,
      }
      let config = {}

      if (registerForm.role === 'student') {
        for (let index = 0; index < studentSteps.length; index += 1) {
          if (!validateStudentStep(index)) {
            setStep(index)
            setLoading(false)
            return
          }
        }

        const formData = new FormData()
        formData.append('name', registerForm.full_name)
        formData.append('email', registerForm.email)
        formData.append('password', registerForm.password)
        formData.append('password_confirmation', registerForm.password_confirmation)
        formData.append('role', 'student')
        formData.append('phone', registerForm.phone)
        formData.append('city', registerForm.city)
        formData.append('university', registerForm.university)
        formData.append('degree', registerForm.degree)
        formData.append('field_of_study', registerForm.field_of_study)
        formData.append('experience_title', registerForm.experience_title)
        formData.append('experience_description', registerForm.experience_description)
        formData.append('internship_type', registerForm.internship_type)
        formData.append('preferred_location', registerForm.location)
        appendFormArray(formData, 'skills', registerForm.skills)
        appendFormArray(formData, 'preferred_technologies', registerForm.technologies)

        if (registerForm.cv) {
          formData.append('cv', registerForm.cv)
        }

        payload = formData
        config = {}
      }

      const createdUser = await register(payload, config)
      startTransition(() => navigate(roleHomePath(createdUser.role)))
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to create your account right now.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="fade-up">
          <div className="flex items-center gap-4">
            <img src={logoIcon} alt="AI Internship Matcher" className="h-16 w-16 shrink-0" />
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-blue-600">AI Internship</p>
              <p className="text-3xl font-extrabold leading-none text-slate-950">Matcher</p>
            </div>
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl">
            Find internships that match your profile, skills, and career goals.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Create a structured student CV, get skill-based recommendations, and manage applications in a clean professional workspace.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[
              ['CV profile', 'Education, skills, CV, and preferences.'],
              ['Smart ranking', 'Recommendations based on skill overlap.'],
              ['Hiring workflow', 'Apply, track, and review in one place.'],
            ].map(([title, text]) => (
              <article key={title} className="soft-card rounded-2xl p-5">
                <h2 className="font-extrabold text-slate-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="app-card fade-up rounded-3xl p-5 sm:p-7 lg:p-8">
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
            {['login', 'register'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setMode(tab)
                  setError('')
                }}
                className={`rounded-xl px-4 py-3 text-sm font-extrabold capitalize transition ${
                  mode === tab ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {error ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

          {mode === 'login' ? (
            <form className="space-y-4" onSubmit={handleLogin}>
              <FormInput label="Email" type="email" value={loginForm.email} onChange={(value) => setLoginForm({ ...loginForm, email: value })} placeholder="student@example.com" />
              <FormInput label="Password" type="password" value={loginForm.password} onChange={(value) => setLoginForm({ ...loginForm, password: value })} placeholder="Enter your password" />
              <PrimaryButton loading={loading} loadingText="Signing in...">Sign in</PrimaryButton>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleRegister}>
              <div className="grid gap-4 sm:grid-cols-[1fr_13rem]">
                <div>
                  <p className="text-sm font-bold text-blue-600">Create your account</p>
                  <h2 className="mt-1 text-2xl font-extrabold text-slate-950">Professional onboarding</h2>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Role</span>
                  <select className="form-field" value={registerForm.role} onChange={(event) => updateRegister('role', event.target.value)}>
                    <option value="student">Student</option>
                    <option value="company">Company</option>
                  </select>
                </label>
              </div>

              {registerForm.role === 'student' ? (
                <>
                  <Stepper step={step} completion={completion} />
                  <div className="min-h-[360px] overflow-hidden">
                    <div key={step} className="step-panel space-y-4">
                      <StudentStep form={registerForm} step={step} update={updateRegister} addTag={addTag} removeTag={removeTag} />
                    </div>
                  </div>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" onClick={() => setStep((current) => Math.max(current - 1, 0))} disabled={step === 0} className="secondary-button disabled:cursor-not-allowed disabled:opacity-50">
                      Back
                    </button>
                    {step < studentSteps.length - 1 ? (
                      <button type="button" onClick={goNext} className="primary-button">
                        Continue
                      </button>
                    ) : (
                      <PrimaryButton loading={loading} loadingText="Creating profile...">Create CV profile</PrimaryButton>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <FormInput label="Contact name" value={registerForm.full_name} onChange={(value) => updateRegister('full_name', value)} placeholder="Your full name" />
                  <FormInput label="Company name" value={registerForm.company_name} onChange={(value) => updateRegister('company_name', value)} placeholder="Northwind Labs" />
                  <FormInput label="Email" type="email" value={registerForm.email} onChange={(value) => updateRegister('email', value)} placeholder="company@example.com" />
                  <FormTextarea label="Description" value={registerForm.description} onChange={(value) => updateRegister('description', value)} placeholder="A quick overview of your company and internship environment." />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput label="Password" type="password" value={registerForm.password} onChange={(value) => updateRegister('password', value)} placeholder="At least 8 characters" />
                    <FormInput label="Confirm password" type="password" value={registerForm.password_confirmation} onChange={(value) => updateRegister('password_confirmation', value)} placeholder="Repeat your password" />
                  </div>
                  <PrimaryButton loading={loading} loadingText="Creating company...">Create company account</PrimaryButton>
                </div>
              )}
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

function StudentStep({ form, step, update, addTag, removeTag }) {
  if (step === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput label="Full name" value={form.full_name} onChange={(value) => update('full_name', value)} placeholder="Sara El Amrani" />
        <FormInput label="Email" type="email" value={form.email} onChange={(value) => update('email', value)} placeholder="sara@example.com" />
        <FormInput label="Password" type="password" value={form.password} onChange={(value) => update('password', value)} placeholder="At least 8 characters" />
        <FormInput label="Confirm password" type="password" value={form.password_confirmation} onChange={(value) => update('password_confirmation', value)} placeholder="Repeat password" />
        <FormInput label="Phone" value={form.phone} onChange={(value) => update('phone', value)} placeholder="+212 6 00 00 00 00" />
        <FormInput label="City" value={form.city} onChange={(value) => update('city', value)} placeholder="Casablanca" />
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput label="University" value={form.university} onChange={(value) => update('university', value)} placeholder="University name" />
        <FormInput label="Degree" value={form.degree} onChange={(value) => update('degree', value)} placeholder="Bachelor, Master..." />
        <div className="sm:col-span-2">
          <FormInput label="Field of study" value={form.field_of_study} onChange={(value) => update('field_of_study', value)} placeholder="Computer Science, Data Science..." />
        </div>
      </div>
    )
  }

  if (step === 2) {
    return <TagEditor inputLabel="Skills" inputValue={form.skillInput} tags={form.skills} onInputChange={(value) => update('skillInput', value)} onAdd={() => addTag('skillInput', 'skills')} onRemove={(tag) => removeTag('skills', tag)} placeholder="JavaScript, Python, React" />
  }

  if (step === 3) {
    return (
      <div className="space-y-4">
        <FormInput label="Experience title" value={form.experience_title} onChange={(value) => update('experience_title', value)} placeholder="Frontend Intern, Academic Project Lead..." />
        <FormTextarea label="Description" value={form.experience_description} onChange={(value) => update('experience_description', value)} placeholder="Summarize a project, internship, freelance work, or leave blank." />
      </div>
    )
  }

  if (step === 4) {
    return (
      <label className="block rounded-2xl border border-dashed border-blue-300 bg-blue-50 p-8 text-center transition hover:border-blue-500">
        <span className="block text-lg font-extrabold text-slate-950">{form.cv ? form.cv.name : 'Upload your CV as a PDF'}</span>
        <span className="mt-2 block text-sm text-slate-500">PDF only, up to 5 MB. You can skip this and add it later.</span>
        <input className="sr-only" type="file" accept="application/pdf" onChange={(event) => update('cv', event.target.files?.[0] ?? null)} />
      </label>
    )
  }

  return (
    <div className="space-y-4">
      <TagEditor inputLabel="Preferred technologies" inputValue={form.preferredTechInput} tags={form.technologies} onInputChange={(value) => update('preferredTechInput', value)} onAdd={() => addTag('preferredTechInput', 'technologies')} onRemove={(tag) => removeTag('technologies', tag)} placeholder="Laravel, React, AI, SQL" />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Internship type</span>
          <select className="form-field" value={form.internship_type} onChange={(event) => update('internship_type', event.target.value)}>
            <option>Remote</option>
            <option>Hybrid</option>
            <option>On-site</option>
            <option>Full-time</option>
            <option>Part-time</option>
          </select>
        </label>
        <FormInput label="Location" value={form.location} onChange={(value) => update('location', value)} placeholder="Casablanca, Rabat, Remote..." />
      </div>
    </div>
  )
}

function Stepper({ step, completion }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold text-slate-950">{studentSteps[step].title}</p>
          <p className="text-xs font-medium text-slate-500">{studentSteps[step].hint}</p>
        </div>
        <p className="text-sm font-extrabold text-blue-700">{completion}%</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${completion}%` }} />
      </div>
    </div>
  )
}

function TagEditor({ inputLabel, inputValue, tags, onInputChange, onAdd, onRemove, placeholder }) {
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">{inputLabel}</span>
        <div className="flex gap-2">
          <input className="form-field" value={inputValue} onChange={(event) => onInputChange(event.target.value)} onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              onAdd()
            }
          }} placeholder={placeholder} />
          <button type="button" onClick={onAdd} className="primary-button">
            Add
          </button>
        </div>
      </label>
      <div className="flex min-h-16 flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        {tags.map((tag) => (
          <button key={tag} type="button" onClick={() => onRemove(tag)} className="skill-tag hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">
            {tag}
          </button>
        ))}
        {!tags.length ? <span className="text-sm text-slate-400">Add at least one tag.</span> : null}
      </div>
    </div>
  )
}

function FormInput({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input className="form-field" type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}

function FormTextarea({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <textarea className="form-field min-h-28 resize-y" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}

function PrimaryButton({ children, loading, loadingText }) {
  return (
    <button type="submit" disabled={loading} className="primary-button disabled:cursor-not-allowed disabled:opacity-70">
      {loading ? loadingText : children}
    </button>
  )
}
