import { onUnmounted } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollAnim() {
  const _st: ScrollTrigger[] = []
  const SCROLLER = '.trailer-page'

  function anim(
    targets: gsap.TweenTarget,
    from: gsap.TweenVars,
    to: gsap.TweenVars,
    stVars: ScrollTrigger.Vars
  ) {
    const tw = gsap.fromTo(targets, from, {
      ...to,
      scrollTrigger: {
        scroller: SCROLLER,
        scrub: 1,
        invalidateOnRefresh: true,
        ...stVars,
      }
    })
    if (tw.scrollTrigger) _st.push(tw.scrollTrigger)
    return tw
  }

  function timeline(stVars: ScrollTrigger.Vars) {
    const tl = gsap.timeline({
      scrollTrigger: {
        scroller: SCROLLER,
        scrub: 1,
        invalidateOnRefresh: true,
        ...stVars,
      }
    })
    if (tl.scrollTrigger) _st.push(tl.scrollTrigger)
    return tl
  }

  onUnmounted(() => {
    _st.forEach(t => t.kill())
    _st.length = 0
  })

  return { anim, timeline, SCROLLER }
}
