import { asset, link, project, tag } from "@prisma/client";

export interface ProjectQuery extends project {
    assets: asset[]
    tags: tag[];
    links: link[];
}