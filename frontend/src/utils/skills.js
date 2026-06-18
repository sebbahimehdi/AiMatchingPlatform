export function parseSkills(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((skill) => String(skill).trim().toLowerCase()).filter(Boolean))]
  }

  return [...new Set(String(value ?? '')
    .split(/,|\n/)
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean))]
}

export function stringifySkills(skills) {
  return Array.isArray(skills) ? skills.join(', ') : ''
}
