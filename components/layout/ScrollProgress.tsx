/**
 * Reading-progress bar across the top of the page.
 *
 * A scroll-driven CSS animation, not a JavaScript scroll listener. The browser
 * runs it off the main thread entirely; the previous version recalculated a
 * spring on every scroll frame.
 *
 * Where `animation-timeline` is unsupported (Safari and Firefox at time of
 * writing) the bar simply stays at zero width and is invisible — a progress
 * indicator is the definition of an enhancement, and it is not worth a
 * JavaScript fallback that costs every visitor to serve some of them.
 *
 * A server component now: there is nothing left for it to do on the client.
 */
export function ScrollProgress() {
  return (
    <div
      aria-hidden="true"
      className="anim-scroll-progress pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-[image:var(--gradient-fill)]"
    />
  );
}
