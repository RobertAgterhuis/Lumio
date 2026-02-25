export interface VideoboodschapOntvanger {
  id: string;
  erfgenaamId: string;
}

export interface Videoboodschap {
  id: string;
  titel: string;
  beschrijving?: string;
  bestandsNaam: string;
  contentType: string;
  bestandsGrootte: number;
  duurSeconden?: number;
  ontvangers: VideoboodschapOntvanger[];
  aangemaaktOp: string;
  gewijzigdOp: string;
}

export interface VideoboodschapFormData {
  titel: string;
  beschrijving: string;
  /** IDs of the erfgenamen this video is addressed to. */
  ontvangerIds: string[];
  /** The video file to upload (either recorded or selected from disk). */
  file: File | null;
  /** Duration detected by the browser (seconds), sent with the upload. */
  duurSeconden?: number;
}

export const emptyVideoboodschapForm: VideoboodschapFormData = {
  titel: "",
  beschrijving: "",
  ontvangerIds: [],
  file: null,
};
