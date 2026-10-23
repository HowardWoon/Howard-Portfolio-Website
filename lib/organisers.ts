/**
 * R83 (owner: "update all the new logo for my projects to showcase the organisers ... consistent ... professional"):
 * the organiser behind each project, one entry per organiser. The logos are the owner's uploads, trimmed to their ink
 * and 160 px tall (real pixel sizes below, read with sharp). `dark`: the mark is drawn for a dark ground (MUBA's lime
 * hexagon), so it sits on an ink chip inside the same white plate as every other logo.
 */
export type OrganiserId = 'supervity' | 'muba' | 'dosm' | 'gdg' | 'um';

export const ORGANISERS: Record<OrganiserId, { name: string; src: string; w: number; h: number; dark?: boolean }> = {
  supervity: { name: 'Supervity', src: '/images/logos/organisers/supervity.png', w: 606, h: 160 },
  muba: { name: 'MUBA', src: '/images/logos/organisers/muba.png', w: 148, h: 160, dark: true },
  dosm: { name: 'Department of Statistics Malaysia', src: '/images/logos/organisers/dosm.png', w: 366, h: 160 },
  gdg: { name: 'Google Developer Groups', src: '/images/logos/organisers/gdg.png', w: 762, h: 160 },
  um: { name: 'Universiti Malaya', src: '/images/logos/organisers/um.png', w: 491, h: 160 },
};
