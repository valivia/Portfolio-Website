/* eslint-disable semi */
import { tag, project } from "@prisma/client";

export default interface experience extends tag {
  score: number;
  notable_project?: project;
  projects: { name: string; uuid: string }[];
}
