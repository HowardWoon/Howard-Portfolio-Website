export interface FieldRecord {
  id: string;
  image: string;
  recordId: string;
  category: string;
  event: string;
  role: string;
  caption: string;
}

export const ARCHIVE_DATA: Record<string, FieldRecord[]> = {
  mytech: [
    {
      id: 'mytech-01',
      image: '/images/experience/mytech/01.jpg',
      recordId: '01',
      category: 'EVENT EXECUTION',
      event: 'MYTECH CAREER FAIR 2026',
      role: 'FINANCE LEAD & TREASURER',
      caption:
        'Supervising the opening ceremony from the main stage, coordinating technical and operational handovers.',
    },
    {
      id: 'mytech-02',
      image: '/images/experience/mytech/02.jpg',
      recordId: '02',
      category: 'TEAM OPERATIONS',
      event: 'MYTECH CAREER FAIR 2026',
      role: 'FINANCE LEAD & TREASURER',
      caption: 'Organizing the primary committee during the mass briefing session prior to door opening.',
    },
    {
      id: 'mytech-03',
      image: '/images/experience/mytech/03.jpg',
      recordId: '03',
      category: 'STAKEHOLDER ENGAGEMENT',
      event: 'MYTECH CAREER FAIR 2026',
      role: 'FINANCE LEAD & TREASURER',
      caption: 'Liaising with corporate sponsors and executive guests at the main booth cluster.',
    },
    {
      id: 'mytech-04',
      image: '/images/experience/mytech/04.jpg',
      recordId: '04',
      category: 'OPERATIONAL EXECUTION',
      event: 'MYTECH CAREER FAIR 2026',
      role: 'FINANCE LEAD & TREASURER',
      caption: 'Managing the lucky draw deployment protocol and logistical tracking for sponsor merchandise.',
    },
    {
      id: 'mytech-05',
      image: '/images/experience/mytech/05.jpg',
      recordId: '05',
      category: 'CLOSURE & HANDOVER',
      event: 'MYTECH CAREER FAIR 2026',
      role: 'FINANCE LEAD & TREASURER',
      caption: 'Post-event operational closure, finalizing sponsor sign-offs and committee offboarding.',
    },
  ],
  // R56 (owner: "i have uploaded the folder of photos for the treasurer of mental health week and share your love,
  // you must upload this as gallery ... make sure always consistent the standard"): the same Field Archive as MYTECH.
  // AGENTS.md 6.1 order: the group at the result first (the Mental Health Week banner), then the event at work, then
  // the Share Your Love outreach. Captions say what each photo shows (the alt text of the print); real sizes are in
  // components/arena-reel.tsx (ARCHIVE_SIZE).
  mhw: [
    {
      id: 'mhw-01',
      image: '/images/experience/mhw/01.jpg',
      recordId: '01',
      category: 'EVENT EXECUTION',
      event: 'MENTAL HEALTH WEEK & SHARE YOUR LOVE',
      role: 'TREASURER',
      caption: 'Participants and committee gathered on the field behind the Mental Health Week 2025 banner.',
    },
    {
      id: 'mhw-02',
      image: '/images/experience/mhw/02.jpg',
      recordId: '02',
      category: 'OPERATIONAL EXECUTION',
      event: 'MENTAL HEALTH WEEK & SHARE YOUR LOVE',
      role: 'TREASURER',
      caption:
        'Committee members running the event counter, with a laptop on the desk and medals laid out for participants.',
    },
    {
      id: 'mhw-03',
      image: '/images/experience/mhw/03.jpg',
      recordId: '03',
      category: 'CHARITY OUTREACH',
      event: 'MENTAL HEALTH WEEK & SHARE YOUR LOVE',
      role: 'TREASURER',
      caption:
        'Volunteers and children in front of Rumah Kasih Harmoni Paya Jaras during the Share Your Love outreach.',
    },
    {
      id: 'mhw-04',
      image: '/images/experience/mhw/04.jpg',
      recordId: '04',
      category: 'CHARITY OUTREACH',
      event: 'MENTAL HEALTH WEEK & SHARE YOUR LOVE',
      role: 'TREASURER',
      caption: 'The same group pointing up at the signboard of the home at the end of the visit.',
    },
    {
      id: 'mhw-05',
      image: '/images/experience/mhw/05.jpg',
      recordId: '05',
      category: 'CHARITY OUTREACH',
      event: 'MENTAL HEALTH WEEK & SHARE YOUR LOVE',
      role: 'TREASURER',
      caption: 'A volunteer showing a group of children an activity on a laptop.',
    },
    {
      id: 'mhw-06',
      image: '/images/experience/mhw/06.jpg',
      recordId: '06',
      category: 'CHARITY OUTREACH',
      event: 'MENTAL HEALTH WEEK & SHARE YOUR LOVE',
      role: 'TREASURER',
      caption: 'Children gathered around a volunteer and a laptop during the activity session.',
    },
    {
      id: 'mhw-07',
      image: '/images/experience/mhw/07.jpg',
      recordId: '07',
      category: 'CHARITY OUTREACH',
      event: 'MENTAL HEALTH WEEK & SHARE YOUR LOVE',
      role: 'TREASURER',
      caption: 'Volunteers sitting on the floor with the children during the refreshment break.',
    },
  ],
};
