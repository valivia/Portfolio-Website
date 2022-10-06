/* eslint-disable no-shadow */
/* eslint-disable semi */

export enum Category {
  Software,
  Language,
  Framework,
  Other,
}

export default interface Tag {
  id: string;

  used_since: string;
  icon_updated_at?: string;
  notable_project?: string;

  name: string;
  description?: string;
  website?: string;

  score?: number;
  category: Category;
}

export interface TagInput extends Omit<Tag, "category" | "id"> {
  id?: string;
  category: string;
}


export interface TagExperience extends Tag {
  icon_updated_at: string;
  score: number;
}