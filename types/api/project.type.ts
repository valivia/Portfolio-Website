/* eslint-disable no-shadow */
/* eslint-disable semi */
import Asset from "./asset.type";
import Tag from "./tag.type";

export enum Status {
  InProgress,
  Abandoned,
  Finished,
  Unknown,
  OnHold,
}

export function StatusToString(input: Status): string {

  switch (input.toString()) {
    case "InProgress":
      return "In Progress"
    case "OnHold":
      return "On hold"
    default:
      return input.toString();
  }
}

export default interface Project {
  id: string;

  created_at: string;
  updated_at: string;

  name: string;
  description?: string;
  markdown?: string;

  banner_id?: string;
  status: Status;

  is_project: boolean;
  is_pinned: boolean;

  assets: Asset[];
  tags: Tag[];
}

export interface ProjectInput extends Omit<Project, "id" | "status" | "tags"> {
  id?: string;
  status: string;
  tags: { name: string, id: string }[];
}