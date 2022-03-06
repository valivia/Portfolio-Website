import { asset, tag, project_status, asset_type, project, link } from ".prisma/client";

export interface ProjectQuery extends project {
    assets: asset[]
    tags: tag[];
    links: link[];
}

export interface GalleryImage {
    size: number;
    alt: string;
    type: asset_type;
    project_uuid: string;
    created: Date;
    name: string;
    uuid: string;
    thumbnail: boolean;
    status: project_status;
    tags: tag[];
    description: string;
}

export interface Project extends project {
    tags: tag[];
    assets: asset[];
}

export interface parsedProject extends project {
    tags: string[];
    assets: asset[];
}

export interface SkillCategory {
    name: string;
    items: Skill[];
}

export interface Skill {
    name: string;
    inverted: boolean;
    url: string;
}