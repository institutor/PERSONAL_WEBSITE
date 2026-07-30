/**
 * Single source of truth for all resume content.
 * Extracted from Jiewen_Huang_Resume (3).pdf — phone number intentionally omitted
 * everywhere (user decision: never published on the site or the downloadable PDF).
 */

export const identity = {
  name: "Jiewen Huang",
  signature: "by Jiewen",
  tagline: "CS & Math @ Columbia '30 · builds things that ship.",
  location: "Brooklyn, NY",
  scholar: "QuestBridge National College Match Scholar",
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
    detail: "B.A. Computer Science & Mathematics, Class of 2030",
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
    role: "Software Development Intern → Software Engineer",
    location: "New York, NY",
    period: "Feb 2025 – Present",
    featured: true,
    bullets: [
      "Designed and shipped NaomiAI ELA from scratch: a K-8 reading-intervention platform now in production for 190 students at Legacy College Prep (South Bronx charter), with a paid annual contract and a 2-year research partnership.",
      "Built a secure Supabase PostgreSQL backend with row-level security across 13+ student-data tables and 160+ singleton services, with a React / TypeScript / Tailwind frontend.",
      "Started as a paid CS4ALL Pathfinders intern under Justice Jones; hired part-time after the internship for outstanding performance.",
    ],
    stats: [
      { value: "190", label: "students in production" },
      { value: "13+", label: "RLS-secured tables" },
      { value: "160+", label: "singleton services" },
      { value: "2-yr", label: "research partnership" },
    ],
    tech: ["React", "TypeScript", "Tailwind", "Supabase", "PostgreSQL"],
  },
  {
    company: "Fed10 (Y Combinator W26)",
    role: "Software Engineering Intern",
    location: "San Francisco, CA",
    period: "Jan – Jun 2026",
    bullets: [
      "Built asynchronous Python web scrapers aggregating municipal regulations and laws from government databases into a single centralized store.",
      "Re-architected a 100k+ line Flask backend to be agent-native: a CLAUDE.md resolver table routes AI coding agents to 22 area-specific docs so agents load the right context before touching code.",
    ],
    stats: [
      { value: "100k+", label: "lines re-architected" },
      { value: "22", label: "agent-routing docs" },
    ],
    tech: ["Python", "Flask", "Temporal"],
  },
  {
    company: "O2NYC",
    role: "Software Engineer & Volunteer",
    location: "New York, NY",
    period: "Dec 2024 – Present",
    bullets: [
      "Built and shipped pages for o2nyc.org, supporting the nonprofit's mission to deploy affordable PM2.5 air-quality sensors in underserved NYC neighborhoods.",
      "Contributed to $8,000+ raised and assembled sensor hardware across 15+ volunteer hours.",
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
      "Lead the web crew building stuycast.org in Next.js, React, TypeScript and Tailwind, showcasing video productions to 3,000+ students.",
      "Shipped the team roster, a YouTube-integrated video gallery, Instagram embeds, and Three.js + Framer Motion visual effects.",
    ],
  },
  {
    org: "Junior & Senior Caucus",
    role: "Web Developer / IT Lead",
    period: "Jul 2024 – Jun 2026",
    bullets: [
      "Spearheaded front-end development of the Junior and Senior Caucus sites: 3,000+ lines of React over two years, maintained live through the school year.",
      "Helped raise $2,000 toward Junior Prom.",
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

export const programs = [
  {
    name: "MITES Summer @ MIT",
    detail:
      "1 of 65 from 6,000+ applicants (~1% admit), fully funded. Led a 4-person team running a paid public survey on perceptions of AI-generated work (Qualtrics + Prolific, 200+ respondents); analyzed results in R and Python; presented at the MITES 2025 Symposium.",
    period: "Summer 2025",
  },
  {
    name: "NYU Cybersecurity for CS (CS4CS)",
    detail:
      "Four-week cybersecurity program in Python; authored a research paper on AI's future applications in cybersecurity.",
    period: "Summer 2024",
  },
] as const;

export interface Award {
  title: string;
  detail: string;
  year: string;
  /** When set, rendered huge in Shantell (the "3rd" / "4th" treatment). */
  big?: string;
}

export const awards: readonly Award[] = [
  { title: "3rd Overall", detail: "Citadel / Citadel Securities High School Terminal", year: "2026", big: "3rd" },
  { title: "4th Place", detail: "Jane Street NYC Mystery Planet", year: "2026", big: "4th" },
  { title: "National Merit Finalist", detail: "PSAT/NMSQT 1500", year: "2025" },
  { title: "Best Academic Award, Economics", detail: "MITES Summer @ MIT", year: "2025" },
  { title: "Irwin Zahn Spirit of Innovation Prize", detail: "$1,000", year: "2025" },
  { title: "Daniel Bergstein 1980 Memorial Scholarship", detail: "$2,500", year: "2025" },
  { title: "11× Science Olympiad medals", detail: "Yale, Columbia, Brown, Enloe, Jordan & Lexington invitationals", year: "2023–26" },
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
