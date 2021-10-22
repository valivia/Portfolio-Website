import { asset, tag, project_status, asset_type, project } from ".prisma/client";

export interface ProjectsQuery extends project {
    assets: asset[]
    tags: tag;
}

export interface ProjectQuery extends project {
    assets: asset[]
    tags: tag[]
}

export interface GalleryImage {
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