export function roleHomePath(role) {
  if (role === 'student') {
    return '/student'
  }

  if (role === 'company') {
    return '/company'
  }

  if (role === 'admin') {
    return '/admin'
  }

  return '/internships'
}
