import { createFictifApp, useRouter, page, useCurtain } from "fictif"
import "fictif/style"
import '@/styles/app.css'

// ── Configure curtain with chemistry-themed messages ──
const curtain = useCurtain({
  icon: 'PhCube',
  inspirationalMessages: [
    { message: 'Element is a purely functional chemistry engine.', background: '' },
    { message: 'Everything is a molecule; every reaction is a transformation.', background: '' },
    { message: 'No canned animations—all bond formations are real-time simulation.', background: '' },
    { message: 'Built for exploration, from basic combustion to esterification.', background: '' },
    { message: 'Open source and designed to be embedded anywhere.', background: '' },
  ],
})

// ── Setup router ──
const router = useRouter()

router.get('/', () => page('Menu'))
router.get('/main', () => page('Game'))
router.get('/about', () => page('About'))

// ── Create app ──
createFictifApp({
  appName: 'Element',
});




