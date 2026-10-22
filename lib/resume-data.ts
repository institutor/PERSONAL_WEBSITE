/**
 * Single source of truth for all resume content.
 * Synced with jiewen_huang.pdf (2026-10-22) — phone number intentionally omitted
 * everywhere (user decision: never published on the site or the downloadable PDF).
 */

export const identity = {
  name: "Jiewen Huang",
  signature: "by Jiewen",
  tagline: "CS & Math @ Columbia '30.",
  /** The hero's school tab, hanging off the bar under JIEWEN. */
  heroLine: "Columbia University, Co'2030",
  location: "Brooklyn, NY",
  scholar: "QuestBridge National College Match Recipient",
  links: {
    email: "jiewenhuang3@gmail.com",
    linkedin: "https://linkedin.com/in/jhuang07",
    github: "https://github.com/institutor",
    resumePdf: "/Jiewen_Huang_Resume.pdf",
  },
} as const;

/** The itinerary: one departure, one arrival, the match as the route. */
export const journey = {
  from: {
    title: "Stuyvesant High School",
    detail: "Class of 2026",
    label: "DEP · WHERE IT STARTED",
  },
  via: "VIA QUESTBRIDGE · NATIONAL COLLEGE MATCH · FULL RIDE",
  to: {
    title: "Columbia University",
    detail: "B.A. Computer Science & Mathematics (Dual Degree), Class of 2030",
    label: "ARR · WHAT'S NEXT",
  },
} as const;

export interface ExperienceEntry {
  company: string;
  role: string;
  location: string;
  period: string;
  featured?: boolean;
  bullets: string[];
  stats?: { value: string; label: string }[];
  tech?: string[];
}

export const experience: ExperienceEntry[] = [
  {
    company: "24/7 Teach",
    role: "Software Development Intern → Software Engineer (Part-Time)",
    location: "New York, NY",
    period: "Feb 2025 – Jun 2026",
    featured: true,
    bullets: [
      "Built and deployed NaomiAI ELA, a K-8 learning platform, to 190 students at Legacy College Prep, supporting a paid annual contract and a two-year research partnership.",
      "Developed the React / TypeScript frontend and a Supabase PostgreSQL backend with row-level security across 13+ student-data tables.",
      "Started through an NYCDOE-funded internship; brought on part-time after excellent performance.",
    ],
    stats: [
      { value: "190", label: "students on the platform" },
      { value: "13+", label: "RLS-secured tables" },
      { value: "2-yr", label: "research partnership" },
    ],
    tech: ["React", "TypeScript", "Supabase", "PostgreSQL"],
  },
  {
    company: "Fed10 (Y Combinator W26)",
    role: "Software Engineering Intern",
    location: "San Francisco, CA",
    period: "Jan – Jun 2026",
    bullets: [
      "Built asynchronous Python web scrapers to aggregate municipal regulations and laws from government databases.",
      "Created a documentation resolver for AI agents across a 100,000+ line Flask backend, routing agents to 22 area-specific guides.",
    ],
    stats: [
      { value: "100k+", label: "line Flask backend" },
      { value: "22", label: "area-specific agent guides" },
    ],
    tech: ["Python", "Flask"],
  },
  {
    company: "O2NYC",
    role: "Software Engineer & Volunteer",
    location: "New York, NY",
    period: "Dec 2024 – Present",
    bullets: [
      "Built and shipped React / CSS pages for o2nyc.org, supporting the nonprofit's deployment of affordable air-quality sensors in underserved NYC neighborhoods.",
      "Contributed to $8,000+ raised across 15+ volunteer hours and helped assemble air-quality sensor hardware.",
    ],
    tech: ["React", "CSS"],
  },
];

export interface LeadershipEntry {
  org: string;
  role: string;
  period: string;
  bullets: string[];
  note?: string;
}

export const leadership: LeadershipEntry[] = [
  {
    org: "StuyCast",
    role: "VP of Web Development",
    period: "Sep 2025 – Jun 2026",
    bullets: [
      "Led development of stuycast.org in React and Tailwind CSS, showcasing video productions to a school community of 3,000+.",
      "Built a YouTube-integrated video gallery, the team roster, Instagram embeds, and visual effects with Three.js and Framer Motion.",
    ],
  },
  {
    org: "Stuyvesant Junior & Senior Caucus",
    role: "IT Lead",
    period: "Jul 2024 – Jun 2026",
    bullets: [
      "Developed and maintained the Junior and Senior Caucus websites over two school years, writing 3,000+ lines of React.",
      "Raised over $2,000 to sponsor Junior Prom through on-site advertising.",
    ],
  },
  {
    org: "Science Olympiad",
    role: "Varsity Competitor & Web Dev Lead",
    period: "Sep 2023 – Jun 2026",
    bullets: [
      "Biology study division: 2nd in Epidemiology, 6th in Microbiology out of 300+ schoolwide.",
      "Medal consistently at collegiate invitationals against 60-90+ team fields.",
    ],
  },
];

/** The medal shelf: 11 Science Olympiad medals, meet by meet. */
export const sciolyMedals = [
  { place: "1st ×2", meet: "Lexington Invitational", events: "Water Quality & Pokémon Pset (trial)" },
  { place: "1st & 5th", meet: "Enloe Invitational '26", events: "Pop Quiz (trial) & Water Quality" },
  { place: "3rd & 4th", meet: "Jordan Invitational '26", events: "Troll Facts (trial) & Water Quality" },
  { place: "3rd", meet: "Brown Invitational '26", events: "Disease Detectives" },
  { place: "3rd", meet: "Yale Invitational '26", events: "Water Quality" },
  { place: "4th", meet: "Columbia Invitational '26", events: "Water Quality" },
  { place: "4th ×2", meet: "Yale Invitational '25", events: "Microbe Mission, solo vs teams of two" },
] as const;

/** The resume's RESEARCH section. `detail` is the short line on the AWARDS
    card (which has to fit a pinned viewport); `bullets` are the resume's
    full wording, used by the print resume. */
export const programs = [
  {
    name: "MITES Summer @ MIT",
    detail:
      "1 of 65 from 6,000+ applicants (~1%). Led a team of four running an MIT-funded survey of 200+ respondents on perceptions of AI-generated work; analyzed it in R and Python and presented at the 2025 Symposium.",
    bullets: [
      "Admitted to a cohort of 65 from 6,000+ national applicants (~1%) to complete coursework in E&M Physics, Calculus I, Biochemistry, Humanities, and Economics.",
      "Led a team of four to design and run a survey, fully funded by MIT, of 200+ qualified respondents on perceptions of AI-generated work in Qualtrics & Prolific; analyzed the data in R and Python and presented findings at the 2025 Symposium.",
    ],
    period: "May – Aug 2025",
  },
  {
    name: "NYU Cybersecurity for CS (CS4CS)",
    detail:
      "DTCC-supported program (~70 students, full tuition): Python, ethical hacking, digital forensics; a research paper on AI in cybersecurity.",
    bullets: [
      "Selected for a competitive, DTCC-supported cybersecurity program with ~70 students and full tuition funding; completed intensive training in Python programming, ethical hacking, and digital forensics.",
      "Authored a research paper assessing the feasibility and future applications of artificial intelligence in cybersecurity.",
    ],
    period: "Jul – Aug 2024",
  },
] as const;

export interface Award {
  title: string;
  detail: string;
  /** Empty when the resume gives no year. */
  year: string;
  /** When set, rendered huge in Shantell (the "3rd" / "4th" treatment). */
  big?: string;
}

export const awards: readonly Award[] = [
  { title: "3rd Overall", detail: "Citadel / Citadel Securities High School Terminal", year: "2026", big: "3rd" },
  { title: "4th Overall", detail: "Jane Street Mystery Planet", year: "2026", big: "4th" },
  { title: "4th Overall", detail: "Citadel / Citadel Securities Trading Challenge @ Columbia University", year: "", big: "4th" },
  { title: "National Merit Finalist", detail: "PSAT/NMSQT 1500", year: "2025" },
  { title: "Best Academic Award, Economics", detail: "MITES Summer @ MIT", year: "2025" },
  { title: "Irwin Zahn Spirit of Innovation Prize", detail: "Stuyvesant HS Alumni Association · $1,000", year: "2025" },
  { title: "Daniel Bergstein 1980 Memorial Scholarship", detail: "Stuyvesant HS Alumni Association · $2,500", year: "2025" },
  { title: "11× Science Olympiad invitational medals", detail: "Yale, Columbia, Brown, Enloe, Jordan & Lexington invitationals", year: "2023–26" },
];

export const teaching = [
  {
    org: "Stuyvesant CsDojo",
    role: "Volunteer Tutor",
    detail: "Weekly after-school tutoring in AP CSA and Computer Graphics; weekly confusion-point reports for CS faculty.",
    doodle: "terminal" as const,
  },
  {
    org: "MyPy Coding",
    role: "Mentor",
    detail: "25+ weekly Zoom sessions teaching Python and Scratch fundamentals.",
    doodle: "pencil" as const,
  },
  {
    org: "The Singing Winds",
    role: "Volunteer",
    detail: "Weekly playground setup; helped distribute backpacks and school supplies to 500+ children.",
    doodle: "note" as const,
  },
] as const;

export const skills = {
  Languages: ["Python", "TypeScript", "JavaScript", "Java", "C++", "R"],
  "Frameworks & Libraries": ["React", "Next.js", "Flask", "Tailwind CSS", "Three.js", "Framer Motion", "GSAP"],
  "Platforms & Tools": ["Supabase", "PostgreSQL", "Git", "RStudio", "Qualtrics", "DaVinci Resolve"],
  Spoken: ["English (fluent)", "Mandarin (fluent)"],
} as const;

/** Chips that get the "you're looking at these right now" margin note. */
export const liveStack = ["Next.js", "Three.js", "GSAP", "Tailwind CSS", "React"];

export const adjectives = [
  "curious",
  "meticulous",
  "relentless",
  "playful",
  "rigorous",
  "bilingual",
  "caffeinated",
  "systematic",
  "self-taught",
  "generous",
  "precise",
  "unreasonably persistent",
] as const;

export const colophon =
  "drawn in code: three.js, GSAP · no illustrators were harmed";
