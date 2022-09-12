/* eslint-disable semi */
import { project_status } from "@prisma/client";
import Asset from "./asset.type";
import Tag from "./tag.type";

export default interface Project {
  id?: string;

  created: string;
  updated: string;

  name: string;
  description?: string;
  markdown?: string;

  banner_id?: string;
  status: project_status;

  isProject: boolean;
  isPinned: boolean;

  assets: Asset[];
  tags: Tag[] | { uuid: string; name: string }[];
}
