import { createFictifApp, useRouter, page, useCurtain } from "fictif"
import "fictif/style"
import '@/styles/app.css'

// ── Configure curtain with chemistry-themed messages ──
const curtain = useCurtain({
  icon: 'PhAtom',
  inspirationalMessages: [
    { message: 'Aligning molecular orbitals…', background: '' },
    { message: 'Calibrating bond energies…', background: '' },
    { message: 'Ionizing the reaction chamber…', background: '' },
    { message: 'Heating the catalyst to operating temperature…', background: '' },
    { message: 'Balancing redox equations…', background: '' },
  ],
})

// ── Setup router ──
const router = useRouter()

router.get('/', () => page('Menu'))
router.get('/main', () => page('Game'))
router.get('/about', () => page('About'))

// ── Create app ──
createFictifApp({
  appName: 'ELM',
});




