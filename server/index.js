import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT_FILE = path.join(__dirname, '..', '.dev-api-port')
const RESET_TOKENS_FILE = path.join(__dirname, '..', 'data', 'reset-tokens.json')
const BASE_PORT = Number(process.env.PORT) || 3001

const app = express()

app.use(cors())
app.use(express.json())

/** @type {Map<string, { code: string, expiresAt: number }>} */
const verificationCodes = new Map()

/** @type {Map<string, { email: string, expiresAt: number }>} */
const resetTokens = new Map()

const CODE_TTL_MS = 10 * 60 * 1000
const RESET_TTL_MS = 60 * 60 * 1000

function loadResetTokens() {
  try {
    const raw = fs.readFileSync(RESET_TOKENS_FILE, 'utf8')
    const stored = JSON.parse(raw)
    let loaded = 0
    for (const [token, entry] of Object.entries(stored)) {
      if (entry?.expiresAt > Date.now()) {
        resetTokens.set(token, entry)
        loaded += 1
      }
    }
    if (loaded > 0) {
      console.log(`Loaded ${loaded} active password-reset link(s) from disk.`)
    }
  } catch {
    // no saved tokens yet
  }
}

function saveResetTokens() {
  const stored = Object.fromEntries(resetTokens)
  fs.mkdirSync(path.dirname(RESET_TOKENS_FILE), { recursive: true })
  fs.writeFileSync(RESET_TOKENS_FILE, JSON.stringify(stored, null, 2), 'utf8')
}

loadResetTokens()

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex')
}

function getAppUrl() {
  return (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '')
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePassword(password) {
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (!/\d/.test(password)) return 'Password must include at least one number.'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include at least one special character.'
  return null
}

async function getMailTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })
}

async function deliverEmail({ to, subject, text, html, devLog }) {
  const transporter = await getMailTransporter()

  if (!transporter) {
    if (devLog) console.log(`\n[Africonnect DEV] ${devLog}\n`)
    console.log('To send real emails, create a .env file (see .env.example) with SMTP settings.\n')
    return { devMode: true }
  }

  try {
    await transporter.verify()
  } catch (err) {
    console.error('SMTP connection failed:', err.message)
    throw new Error(
      'Email server connection failed. Check SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env file.',
    )
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Africonnect" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  })

  return { devMode: false }
}

async function sendVerificationEmail(email, code) {
  const subject = 'Your Africonnect verification code'
  const text = `Your verification code is ${code}. It expires in 10 minutes.`
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 480px;">
      <h2 style="color: #1a1a1a;">Verify your email</h2>
      <p>Use this code to complete your Africonnect registration:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #0d9f4f;">${code}</p>
      <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
    </div>
  `

  const result = await deliverEmail({
    to: email,
    subject,
    text,
    html,
    devLog: `Verification code for ${email}: ${code}`,
  })

  if (!result.devMode) console.log(`Verification email sent to ${email}`)
  return { ...result, code: result.devMode ? code : undefined }
}

async function sendPasswordResetEmail(email, resetUrl) {
  const subject = 'Reset your Africonnect password'
  const text = `You requested a password reset. Open this link to choose a new password:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, you can ignore this email.`
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 480px;">
      <h2 style="color: #1a1a1a;">Reset your password</h2>
      <p>We received a request to reset the password for your Africonnect account.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #7ed9a2; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
          Reset Password
        </a>
      </p>
      <p style="color: #6b7280; font-size: 14px;">Or copy this link into your browser:<br><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="color: #6b7280; font-size: 14px;">This link expires in 1 hour.</p>
    </div>
  `

  const result = await deliverEmail({
    to: email,
    subject,
    text,
    html,
    devLog: `Password reset link for ${email}:\n${resetUrl}`,
  })

  if (!result.devMode) console.log(`Password reset email sent to ${email}`)
  return { ...result, resetUrl: result.devMode ? resetUrl : undefined }
}

app.post('/api/auth/send-code', async (req, res) => {
  try {
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase()

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' })
    }

    const code = generateCode()
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + CODE_TTL_MS,
    })

    const { devMode, code: devCode } = await sendVerificationEmail(email, code)

    res.json({
      message: devMode
        ? 'Email is not set up yet. Use the code shown on screen (also printed in the terminal).'
        : 'Verification code sent to your email. Check your inbox and spam folder.',
      devMode,
      ...(devMode ? { devCode } : {}),
    })
  } catch (err) {
    console.error('send-code error:', err)
    res.status(500).json({
      message: 'Could not send verification email. Check your email settings and try again.',
    })
  }
})

app.post('/api/auth/verify-code', (req, res) => {
  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase()
  const code = String(req.body?.code || '').trim()

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' })
  }

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: 'Please enter the 6-digit code.' })
  }

  const entry = verificationCodes.get(email)

  if (!entry) {
    return res.status(400).json({
      message: 'No verification code found. Please request a new code.',
    })
  }

  if (Date.now() > entry.expiresAt) {
    verificationCodes.delete(email)
    return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' })
  }

  if (entry.code !== code) {
    return res.status(400).json({ message: 'Invalid verification code. Please try again.' })
  }

  verificationCodes.delete(email)

  res.json({ message: 'Email verified successfully.' })
})

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase()

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' })
    }

    const token = generateResetToken()
    resetTokens.set(token, {
      email,
      expiresAt: Date.now() + RESET_TTL_MS,
    })
    saveResetTokens()

    const resetUrl = `${getAppUrl()}/reset-password?token=${token}`
    const { devMode, resetUrl: devResetUrl } = await sendPasswordResetEmail(email, resetUrl)

    res.json({
      message:
        'If this email is registered, you will receive password reset instructions shortly. Check your inbox and spam folder.',
      devMode,
      ...(devMode ? { resetUrl: devResetUrl } : {}),
    })
  } catch (err) {
    console.error('forgot-password error:', err)
    res.status(500).json({
      message: 'Could not send reset email. Check your email settings and try again.',
    })
  }
})

app.post('/api/auth/reset-password', (req, res) => {
  const token = String(req.body?.token || '').trim()
  const password = String(req.body?.password || '')
  const confirmPassword = String(req.body?.confirmPassword || '')

  if (!token) {
    return res.status(400).json({ message: 'Invalid or missing reset link. Please request a new one.' })
  }

  const passwordError = validatePassword(password)
  if (passwordError) {
    return res.status(400).json({ message: passwordError })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' })
  }

  const entry = resetTokens.get(token)

  if (!entry) {
    return res.status(400).json({
      message: 'This reset link is invalid or has already been used. Please request a new one.',
    })
  }

  if (Date.now() > entry.expiresAt) {
    resetTokens.delete(token)
    saveResetTokens()
    return res.status(400).json({ message: 'This reset link has expired. Please request a new one.' })
  }

  resetTokens.delete(token)
  saveResetTokens()

  // TODO: persist new password when user database is added
  console.log(`Password reset completed for ${entry.email}`)

  res.json({ message: 'Your password has been reset. You can now log in with your new password.' })
})

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    features: ['send-code', 'verify-code', 'forgot-password', 'reset-password'],
  })
})

app.use('/api', (_req, res) => {
  res.status(404).json({
    message:
      'API route not found. Stop the app (Ctrl+C), run "npm run dev" again, then request a new reset link.',
  })
})

function logEmailStatus() {
  getMailTransporter()
    .then(async (transporter) => {
      if (transporter) {
        try {
          await transporter.verify()
          console.log('Email: SMTP configured — emails will be sent to inbox.')
        } catch (err) {
          console.warn('Email: SMTP settings found but connection failed:', err.message)
          console.warn('Fix your .env file or codes will not be delivered.')
        }
      } else {
        console.log('Email: NOT configured — codes show on the verify page and in this terminal.')
      }
    })
    .catch((err) => console.warn('Email check failed:', err.message))
}

function tryListen(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => resolve({ server, port }))

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        reject(err)
      } else {
        reject(err)
      }
    })
  })
}

async function startServer() {
  for (let port = BASE_PORT; port < BASE_PORT + 10; port += 1) {
    try {
      const { port: activePort } = await tryListen(port)
      fs.writeFileSync(PORT_FILE, String(activePort), 'utf8')

      if (activePort !== BASE_PORT) {
        console.warn(`Port ${BASE_PORT} was busy — API started on http://localhost:${activePort}`)
      } else {
        console.log(`Africonnect API running on http://localhost:${activePort}`)
      }

      logEmailStatus()
      return
    } catch (err) {
      if (err.code !== 'EADDRINUSE') {
        console.error('Server error:', err.message)
        process.exit(1)
      }
    }
  }

  console.error(`No free port found between ${BASE_PORT} and ${BASE_PORT + 9}.`)
  console.error('Run: npm run kill-port')
  process.exit(1)
}

startServer()
