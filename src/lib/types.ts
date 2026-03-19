export interface TeamMember {
  name: string;
  titleKey: string;
  image: string;
  email?: string;
}

export interface AdvisoryMember {
  name: string;
  credentials: string[];
  image: string;
  linkedIn?: string;
}
