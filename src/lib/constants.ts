import type { TeamMember, AdvisoryMember } from "./types";

export const NAV_ITEMS = [
  { key: "purpose", href: "#purpose" },
  { key: "process", href: "#process" },
  { key: "team", href: "#team" },
  { key: "contact", href: "#contact" },
] as const;

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Fouad el Kanfaoui",
    titleKey: "cfoTitle",
    image: "/images/team/fouad_new.png",
    email: "fouad@darhypotheken.nl",
  },
  {
    name: "Sharif Soliman",
    titleKey: "ceoTitle",
    image: "/images/team/sharif_last.png",
    email: "sharif@darhypotheken.nl",
  },
  {
    name: "Rachid Chetouani",
    titleKey: "croTitle",
    image: "/images/team/rachid_new.png",
    email: "rachid@darhypotheken.nl",
  },
  {
    name: "Albert Trox",
    titleKey: "cioTitle",
    image: "/images/team/albert_new.png",
    email: "albert@darhypotheken.nl",
  },
  {
    name: "Frans de Kievit",
    titleKey: "cooTitle",
    image: "/images/team/frans_new.png",
    email: "frans@darhypotheken.nl",
  },
  {
    name: "Karim Helal",
    titleKey: "cmoTitle",
    image: "/images/team/karim-dar.png",
    email: "karim@darhypotheken.nl",
  },
];

export const ADVISORY_MEMBERS: AdvisoryMember[] = [
  {
    name: "Ferdinand Veenman",
    credentials: [
      "Ex CEO Blauwtrust Groep",
      "Ex Financial Services KPMG",
      "+35 years experience",
    ],
    image: "/images/advisory/ferdinand.png",
  },
  {
    name: "Mike de Boer",
    credentials: ["Ex CFO Knab", "Co founder Knab", "+30 years experience"],
    image: "/images/advisory/mike.png",
  },
  {
    name: "Jan Poot",
    credentials: ["Ex Vontobel", "Ex Aegon", "+35 years experience"],
    image: "/images/advisory/jan.png",
  },
];
