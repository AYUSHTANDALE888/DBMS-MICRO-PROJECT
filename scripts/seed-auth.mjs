import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read .env.local for service-role key
function loadEnvLocal() {
  const envPath = path.resolve(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!')
    console.error('Please create .env.local with:')
    console.error('SUPABASE_URL=https://your-project.supabase.co')
    console.error('SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key')
    process.exit(1)
  }

  const content = fs.readFileSync(envPath, 'utf8')
  const env = {}
  content.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=')
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim()
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
        env[key] = val
      }
    }
  })
  return env
}

const env = loadEnvLocal()
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || SUPABASE_URL.includes('your-project')) {
  console.error('❌ Invalid or placeholder SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Demo credentials list
const demoUsers = [
  // Staff accounts
  { email: 'alex.morgan@college.edu', password: 'Password@123', role: 'Staff', name: 'Alex Morgan' },
  { email: 'rachel.adams@college.edu', password: 'Password@123', role: 'Staff', name: 'Dr. Rachel Adams' },
  { email: 'vikram.shinde@college.edu', password: 'Password@123', role: 'Staff', name: 'Vikram Shinde' },

  // Member accounts
  { email: 'rahul.sharma@college.edu', password: 'Password@123', role: 'Member', name: 'Rahul Sharma' },
  { email: 'priya.patil@college.edu', password: 'Password@123', role: 'Member', name: 'Priya Patil' },
  { email: 'marcus.vance@college.edu', password: 'Password@123', role: 'Member', name: 'Marcus Vance' },
  { email: 'sneha.kulkarni@college.edu', password: 'Password@123', role: 'Member', name: 'Sneha Kulkarni' }
]

async function seedAuth() {
  console.log(`Connecting to Supabase at: ${SUPABASE_URL}`)
  console.log('Seeding demo auth users...\n')

  let createdCount = 0
  let existingCount = 0

  for (const user of demoUsers) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role
        }
      })

      if (error) {
        if (error.message.toLowerCase().includes('already') || error.code === 'email_exists') {
          console.log(`ℹ️  [Exists] ${user.role.padEnd(6)}: ${user.email}`)
          existingCount++
        } else {
          console.error(`❌ [Error] ${user.email}:`, error.message)
        }
      } else {
        console.log(`✅ [Created] ${user.role.padEnd(6)}: ${user.email} (Password: ${user.password})`)
        createdCount++
      }
    } catch (err) {
      console.error(`❌ [Failed] ${user.email}:`, err.message)
    }
  }

  console.log('\n--- Summary ---')
  console.log(`Created: ${createdCount}`)
  console.log(`Already existed: ${existingCount}`)
  console.log(`Total processed: ${demoUsers.length}`)
  console.log('Done!')
}

seedAuth()

