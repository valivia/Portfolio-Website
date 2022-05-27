export interface Skill {
    name: string;
    inverted: boolean;
    url: string;
}

export interface SkillCategory {
    name: string;
    items: Skill[];
}