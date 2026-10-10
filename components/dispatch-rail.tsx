/**
 * R26 Dispatch rail (after React Bits Stepper; native). Above the Dispatch button: the form's own fields as numbered
 * steps - 01 NAME, 02 EMAIL, 03 MESSAGE, 04 DISPATCH - joined by rails that fill as each field becomes valid.
 * Done = ink, current = interactive blue (the next thing to do), pending = white. The email step only completes when
 * the address has a valid shape, so a typo is visible before sending. Screen readers: an ordered list with
 * aria-current="step" on the current step. Pure render from the form state (no timers, no effects).
 */
export function DispatchRail({ done }: { done: [boolean, boolean, boolean, boolean] }) {
  const steps = ['NAME', 'EMAIL', 'MESSAGE', 'DISPATCH'] as const;
  const current = done.indexOf(false);
  return (
    <div className="dispatch-rail-box">
      <ol aria-label="Message progress" className="dispatch-rail">
        {steps.map((label, i) => {
          const state = done[i] ? 'done' : i === current ? 'current' : 'todo';
          return (
            <li key={label} data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
              {i > 0 ? <span aria-hidden className="dispatch-rail-bar" data-on={done[i - 1] ? '' : undefined} /> : null}
              <span className="dispatch-rail-step">
                <span aria-hidden className="dispatch-rail-dot">
                  {done[i] ? '✓' : String(i + 1).padStart(2, '0')}
                </span>
                <span className="dispatch-rail-label">
                  {label}
                  <span className="sr-only">{done[i] ? ' (done)' : ''}</span>
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      {current >= 0 ? (
        <p aria-hidden className="dispatch-rail-now">
          {String(current + 1).padStart(2, '0')} · {steps[current]}
        </p>
      ) : null}
    </div>
  );
}
