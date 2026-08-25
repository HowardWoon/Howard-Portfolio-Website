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
  "mytech": [
    {
      id: "mytech-01",
      image: "/images/experience/mytech/01.jpg",
      recordId: "01",
      category: "EVENT EXECUTION",
      event: "MYTECH CAREER FAIR 2026",
      role: "FINANCE LEAD & TREASURER",
      caption: "Supervising the opening ceremony from the main stage, coordinating technical and operational handovers."
    },
    {
      id: "mytech-02",
      image: "/images/experience/mytech/02.jpg",
      recordId: "02",
      category: "TEAM OPERATIONS",
      event: "MYTECH CAREER FAIR 2026",
      role: "FINANCE LEAD & TREASURER",
      caption: "Organizing the primary committee during the mass briefing session prior to door opening."
    },
    {
      id: "mytech-03",
      image: "/images/experience/mytech/03.jpg",
      recordId: "03",
      category: "STAKEHOLDER ENGAGEMENT",
      event: "MYTECH CAREER FAIR 2026",
      role: "FINANCE LEAD & TREASURER",
      caption: "Liaising with corporate sponsors and executive guests at the main booth cluster."
    },
    {
      id: "mytech-04",
      image: "/images/experience/mytech/04.jpg",
      recordId: "04",
      category: "OPERATIONAL EXECUTION",
      event: "MYTECH CAREER FAIR 2026",
      role: "FINANCE LEAD & TREASURER",
      caption: "Managing the lucky draw deployment protocol and logistical tracking for sponsor merchandise."
    },
    {
      id: "mytech-05",
      image: "/images/experience/mytech/05.jpg",
      recordId: "05",
      category: "CLOSURE & HANDOVER",
      event: "MYTECH CAREER FAIR 2026",
      role: "FINANCE LEAD & TREASURER",
      caption: "Post-event operational closure, finalizing sponsor sign-offs and committee offboarding."
    }
  ]
};