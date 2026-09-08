/**
 * The maker's mark: a small Janus door in the footer line. The mark is the Janus Labs
 * two-path arch (logos/janus-doors, currentColor form). On hover or focus the bone panel
 * swings open on its left hinge, the way the doorway does on januslabsinc.com's halls
 * direction, revealing an ink interior with the bronze arch. Ink and bone only, never a
 * Sylph colour (brand rule); no motion under reduced motion.
 */
export function JanusNod() {
  return (
    <a className="janus-nod" href="https://januslabsinc.com" aria-label="Made by Janus Labs" title="The door is open">
      <span className="janus-well" aria-hidden="true">
        <span className="janus-interior">
          <span className="janus-arch" />
        </span>
        <span className="janus-panel">
          <svg viewBox="0 0 32 32" focusable="false">
            <path d="M4 29 V15 A11 11 0 0 1 15 4 V29 Z" fill="currentColor" />
            <path d="M17.5 29 V5 A10.5 10.5 0 0 1 28 15.5 V29" fill="none" stroke="currentColor" strokeWidth="1.7" />
          </svg>
        </span>
      </span>
      <span className="janus-word">Made by Janus Labs</span>
    </a>
  );
}
