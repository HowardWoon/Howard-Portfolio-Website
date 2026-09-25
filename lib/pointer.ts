/**
 * Latest normalised pointer position (-1..1, 0 = viewport centre), written by FX-01 PointerField.
 * JS consumers (e.g. the Mercury Field shader) read it from here instead of from CSS variables.
 */
export const pointer = { x: 0, y: 0 };

/** Elements whose CSS reads var(--px) / var(--py). PointerField writes the vars on these elements only. */
export const POINTER_CONSUMERS = '.fx-depth, .fx-shadow-follow, .fx-specular, .fx-letterpress';
