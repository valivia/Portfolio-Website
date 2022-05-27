import { project, tag, asset } from "@prisma/client";

export interface ExtendedProject extends project {
    tags: tag[];
    assets: asset[];
}

export interface ParsedExtendedProject extends project {
    tags: string[];
    assets: asset[];
}