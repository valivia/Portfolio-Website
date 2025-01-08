import Project from "./project.type";

/* eslint-disable semi */
export default interface Asset {
  id: string;

  created_at: string;

  alt?: string;
  description?: string;

  is_displayed: boolean;
  is_pinned: boolean;

  width: number;
  height: number;
}

export interface AssetInput extends Omit<Asset, "id"> {
  id?: string;
  file?: Blob | MediaSource;
}

export interface GalleryAsset extends Omit<Asset, "id" | "width" | "height" | "created_at" | "is_displayed"> {
  asset_id: string;
  project_id: string;

  project_name: string,

  project_created_at: string;
  asset_created_at: string;

  size: number;
  is_thumbnail: boolean;
}

export function asset_to_gallery(asset: Asset, project: Project): GalleryAsset {
  return {
    project_id: project.id,
    asset_id: asset.id,

    project_name: project.name,

    description: asset.description,
    alt: asset.alt,

    asset_created_at: asset.created_at,
    project_created_at: project.created_at,

    size: Math.min(asset.width, asset.height),

    is_thumbnail: asset.id === project.id,
    is_pinned: asset.is_pinned,
  }
}