const API_BASE = '/api'

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || `Request failed (${res.status}). Please try again.`)
    }
    return data
  }

  const text = await res.text().catch(() => '')

  if (res.status === 404) {
    throw new Error(
      'The email server is out of date or not running. Press Ctrl+C, run "npm run dev", then request a new password reset link.',
    )
  }

  if (!res.ok) {
    throw new Error(text?.slice(0, 120) || `Request failed (${res.status}). Please try again.`)
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Unexpected server response. Please restart with "npm run dev" and try again.')
  }
}

export async function sendVerificationCode(email) {
  let res
  try {
    res = await fetch(`${API_BASE}/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
  } catch {
    throw new Error(
      'Cannot reach the server. Stop the app, then run "npm run dev" in the project folder (this starts both the website and the email API).',
    )
  }
  return parseResponse(res)
}

export async function verifyEmailCode(email, code) {
  const res = await fetch(`${API_BASE}/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
  return parseResponse(res)
}

async function fetchApi(path, body) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error(
      'Cannot reach the server. Run "npm run dev" in the project folder (website + email API).',
    )
  }
  return parseResponse(res)
}

export function sendPasswordResetEmail(email) {
  return fetchApi('/auth/forgot-password', { email })
}

export function resetPassword({ token, password, confirmPassword }) {
  return fetchApi('/auth/reset-password', { token, password, confirmPassword })
}
