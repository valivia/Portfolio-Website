import { asset_type, project_status, tag } from "@prisma/client";

export interface GalleryImage {
    size: number;
    alt: string;
    pinned: boolean;
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