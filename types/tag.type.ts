import { tag_category } from "@prisma/client";

/* eslint-disable semi */
export default interface Tag {
  id: string;
  created: string;
  used_since: string;

  name: string;
  description?: string;
  website?: string;

  score?: number;
  projectId: string;
  category: tag_category;
}
