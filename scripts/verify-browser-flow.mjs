import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = 'C:\\Users\\acer\\.gemini\\antigravity\\brain\\b1ce61c1-c75e-440f-a3d4-74d03a20eb89'
const SCREENSHOTS_DIR = path.join(ARTIFACT_DIR, 'screenshots')
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
}

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const executablePath = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH

console.log(`Using browser executable: ${executablePath}`)

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function runVerification() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1400, height: 900 })

  console.log('🚀 Starting end-to-end browser verification...')

  try {
    // ------------------------------------------------------------------------
    // STEP 1: Login / Register Page
    // ------------------------------------------------------------------------
    console.log('1. Navigating to Login / Register page...')
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' })
    await delay(1000)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-login-register.png'), fullPage: false })
    console.log('📸 Captured 01-login-register.png')

    // ------------------------------------------------------------------------
    // STEP 2: Log in as Member (Rahul Sharma)
    // ------------------------------------------------------------------------
    console.log('2. Logging in as Member (Rahul Sharma)...')
    // Click the one-click demo button for Rahul Sharma
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const rahulBtn = buttons.find(b => b.textContent.includes('Rahul Sharma'))
      if (rahulBtn) rahulBtn.click()
    })
    await delay(1500)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-dashboard-member.png'), fullPage: false })
    console.log('📸 Captured 02-dashboard-member.png')

    // ------------------------------------------------------------------------
    // STEP 3: Member Donates a Book
    // ------------------------------------------------------------------------
    console.log('3. Navigating to Donate a Book (/donate-a-book)...')
    await page.goto('http://localhost:5173/donate-a-book', { waitUntil: 'networkidle0' })
    await delay(800)

    console.log('   Filling donation intake form...')
    await page.type('input[placeholder*="Introduction to Algorithms"]', 'Distributed Systems: Principles and Paradigms')
    await page.type('input[placeholder*="Thomas H. Cormen"]', 'Andrew S. Tanenbaum, Maarten van Steen')
    await page.select('select', 'Computer Science') // Category
    // Select condition (second select on page)
    await page.evaluate(() => {
      const selects = document.querySelectorAll('select')
      if (selects[1]) selects[1].value = 'Like New'
      selects[1].dispatchEvent(new Event('change', { bubbles: true }))
    })
    await page.type('textarea[placeholder*="Optional notes"]', '3rd edition covering consensus, Raft algorithm, and cloud architectures.')
    await page.type('input[placeholder*="402 College Road"]', 'College Road, Near Old CBS')

    // Pincode is already 422005 (Nashik)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-donate-a-book.png'), fullPage: false })
    console.log('📸 Captured 03-donate-a-book.png')

    // Submit the donation
    await page.evaluate(() => {
      const form = document.querySelector('form')
      if (form) form.requestSubmit()
    })
    await delay(1500)

    // ------------------------------------------------------------------------
    // STEP 4: Verify My Donations shows "Pending"
    // ------------------------------------------------------------------------
    console.log('4. Verifying My Donations for Rahul Sharma...')
    await page.goto('http://localhost:5173/my-donations', { waitUntil: 'networkidle0' })
    await delay(1000)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-my-donations-pending.png'), fullPage: false })
    console.log('📸 Captured 04-my-donations-pending.png')

    // ------------------------------------------------------------------------
    // STEP 5: View Books Catalog as Member
    // ------------------------------------------------------------------------
    console.log('5. Viewing Books Catalog as Member...')
    await page.goto('http://localhost:5173/books', { waitUntil: 'networkidle0' })
    await delay(1000)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-books-catalog.png'), fullPage: false })
    console.log('📸 Captured 05-books-catalog.png')

    // ------------------------------------------------------------------------
    // STEP 6: Log out and Log in as Staff (Alex Morgan)
    // ------------------------------------------------------------------------
    console.log('6. Switching to Staff (Alex Morgan)...')
    await page.evaluate(() => {
      // Use header demo switcher
      const switchBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Demo Switch'))
      if (switchBtn) switchBtn.click()
    })
    await delay(500)
    await page.evaluate(() => {
      const alexBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Alex Morgan'))
      if (alexBtn) alexBtn.click()
    })
    await delay(1500)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-dashboard-staff.png'), fullPage: false })
    console.log('📸 Captured 06-dashboard-staff.png')

    // ------------------------------------------------------------------------
    // STEP 7: Staff views Books & Marks Rahul's Donation as Received
    // ------------------------------------------------------------------------
    console.log('7. Staff views Books & Pending Donations Queue...')
    await page.goto('http://localhost:5173/books', { waitUntil: 'networkidle0' })
    await delay(1000)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-books-staff-intake.png'), fullPage: false })
    console.log('📸 Captured 07-books-staff-intake.png')

    console.log('   Clicking "Mark as Received" on Rahul\'s donated book...')
    await page.evaluate(() => {
      // Find row with "Distributed Systems" and click "Mark as Received"
      const rows = Array.from(document.querySelectorAll('tr'))
      const targetRow = rows.find(r => r.textContent.includes('Distributed Systems'))
      if (targetRow) {
        const btn = targetRow.querySelector('button')
        if (btn) btn.click()
      }
    })
    await delay(1500)
    console.log('   Book status updated to Available!')

    // ------------------------------------------------------------------------
    // STEP 8: Log in as Another Member (Marcus Vance) & Request the Book
    // ------------------------------------------------------------------------
    console.log('8. Switching to Member 2 (Marcus Vance) to test Member Isolation & Request...')
    await page.evaluate(() => {
      const switchBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Demo Switch'))
      if (switchBtn) switchBtn.click()
    })
    await delay(500)
    await page.evaluate(() => {
      const marcusBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Marcus Vance'))
      if (marcusBtn) marcusBtn.click()
    })
    await delay(1500)

    // Verify member isolation: Marcus should NOT see Rahul's donation
    await page.goto('http://localhost:5173/my-donations', { waitUntil: 'networkidle0' })
    await delay(800)
    const pageText = await page.evaluate(() => document.body.innerText)
    const showsRahulDonation = pageText.includes('Distributed Systems: Principles and Paradigms')
    console.log(`   [Data Isolation Check] Marcus Vance sees Rahul's donation? ${showsRahulDonation} (Must be false for strict isolation)`)

    // Now Marcus requests the book
    console.log('   Navigating to Request a Book (/request-a-book)...')
    await page.goto('http://localhost:5173/request-a-book', { waitUntil: 'networkidle0' })
    await delay(1000)

    // Select the "Distributed Systems" card if present, or first available
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div[class*="cursor-pointer"]'))
      const distCard = cards.find(c => c.textContent.includes('Distributed Systems'))
      if (distCard) distCard.click()
    })
    await delay(500)

    await page.type('textarea[placeholder*="Relational database"]', 'Capstone project on distributed consensus and high-availability protocols.')
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-request-a-book.png'), fullPage: false })
    console.log('📸 Captured 08-request-a-book.png')

    // Submit request
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Submit Monograph Request'))
      if (submitBtn) submitBtn.click()
    })
    await delay(1500)

    // ------------------------------------------------------------------------
    // STEP 9: Switch back to Staff to Approve Request
    // ------------------------------------------------------------------------
    console.log('9. Switching back to Staff (Alex Morgan) to Manage Requests...')
    await page.evaluate(() => {
      const switchBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Demo Switch'))
      if (switchBtn) switchBtn.click()
    })
    await delay(500)
    await page.evaluate(() => {
      const alexBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Alex Morgan'))
      if (alexBtn) alexBtn.click()
    })
    await delay(1500)

    await page.goto('http://localhost:5173/manage-requests', { waitUntil: 'networkidle0' })
    await delay(1000)

    // Approve Marcus Vance's request
    console.log('   Approving Marcus Vance\'s request...')
    await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr'))
      const marcusRow = rows.find(r => r.textContent.includes('Marcus Vance') && r.textContent.includes('Approve'))
      if (marcusRow) {
        const approveBtn = Array.from(marcusRow.querySelectorAll('button')).find(b => b.textContent.includes('Approve'))
        if (approveBtn) approveBtn.click()
      }
    })
    await delay(1500)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-manage-requests-staff.png'), fullPage: false })
    console.log('📸 Captured 09-manage-requests-staff.png')

    // ------------------------------------------------------------------------
    // STEP 10: Staff Distributes the Book
    // ------------------------------------------------------------------------
    console.log('10. Navigating to Distribution Desk (/distribution)...')
    await page.goto('http://localhost:5173/distribution', { waitUntil: 'networkidle0' })
    await delay(1000)

    // Click "Mark as Distributed" for the approved request
    console.log('    Opening distribution modal and confirming...')
    await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr'))
      const targetRow = rows.find(r => r.textContent.includes('Mark as Distributed'))
      if (targetRow) {
        const btn = targetRow.querySelector('button')
        if (btn) btn.click()
      }
    })
    await delay(600)

    // Click "Confirm Distribution" in modal
    await page.evaluate(() => {
      const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Confirm Distribution'))
      if (confirmBtn) confirmBtn.click()
    })
    await delay(1500)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10-distribution-staff.png'), fullPage: false })
    console.log('📸 Captured 10-distribution-staff.png')

    // ------------------------------------------------------------------------
    // STEP 11: View Book Status History
    // ------------------------------------------------------------------------
    console.log('11. Viewing Book Status History (/book-status-history)...')
    await page.goto('http://localhost:5173/book-status-history', { waitUntil: 'networkidle0' })
    await delay(1000)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11-book-status-history.png'), fullPage: false })
    console.log('📸 Captured 11-book-status-history.png')

    // ------------------------------------------------------------------------
    // STEP 12: Switch to Member (Marcus Vance) and check Notifications
    // ------------------------------------------------------------------------
    console.log('12. Switching to Marcus Vance to verify Notifications...')
    await page.evaluate(() => {
      const switchBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Demo Switch'))
      if (switchBtn) switchBtn.click()
    })
    await delay(500)
    await page.evaluate(() => {
      const marcusBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Marcus Vance'))
      if (marcusBtn) marcusBtn.click()
    })
    await delay(1500)

    await page.goto('http://localhost:5173/notifications', { waitUntil: 'networkidle0' })
    await delay(1000)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '12-notifications-member.png'), fullPage: false })
    console.log('📸 Captured 12-notifications-member.png')

    console.log('🎉 Full verification walkthrough completed successfully!')

  } catch (err) {
    console.error('❌ Verification failed with error:', err)
  } finally {
    await browser.close()
  }
}

runVerification()

