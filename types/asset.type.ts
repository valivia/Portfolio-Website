/* eslint-disable semi */
export default interface Asset {
  id: string;
  projectId: "";
  created: string;

  alt?: string;
  description?: string;

  width: number;
  height: number;

  isDisplayed: boolean;
  isPinned: boolean;
}
