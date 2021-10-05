import { Project, Assets, Tags } from ".prisma/client";

export interface ProjectsQuery extends Project {
    Assets: Assets[]
    Tags: Tags;
}

export interface ProjectQuery extends Project {
    Assets: Assets[]
    Tags: Tags[]
}

export interface GalleryQuery extends Assets {
    Project: Project;
    Tags: Tags[];
}