import { Project, Assets, TagLink, Tags } from ".prisma/client";

export interface ProjectQuery extends Project {
    Assets: Assets[]
    TagLink: (TagLink & { Tags: Tags; })[];
}

export interface GalleryQuery extends Assets {
    Project: Project;
}