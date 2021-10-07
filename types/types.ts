import { Project, Assets, Tags, Assets_Type } from ".prisma/client";
import { Project_Status } from "@prisma/client";

export interface ProjectsQuery extends Project {
    Assets: Assets[]
    Tags: Tags;
}

export interface ProjectQuery extends Project {
    Assets: Assets[]
    Tags: Tags[]
}

export interface GalleryImage {
    FileName: string | null;
    Name: string;
    Created: Date;
    Description: string;
    Alt: string;
    ID: number;
    Tags: Tags[];
    Status: Project_Status;
    Type: Assets_Type;
    Thumbnail: boolean;
  }