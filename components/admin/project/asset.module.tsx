import { useEffect, useRef, useState } from "react";
import styles from "./asset.module.scss";
import onChangeParser from "../../onchange";
import { submitFormData, submitJson, submitUrl } from "../../submit";
import TextArea from "@components/input/textarea.module";
import Checkbox from "@components/input/checkbox.module";
import { ProjectInput } from "@typeFiles/api/project.type";
import Asset, { AssetInput } from "@typeFiles/api/asset.type";
import NotificationType from "@typeFiles/notification";

const MEDIA = process.env.NEXT_PUBLIC_MEDIA_SERVER;
const EMPTYASSET: AssetInput = {
  created_at: new Date().toISOString(),
  width: 0,
  height: 0,
  is_displayed: false,
  is_pinned: false,
};

export default function AdminPageAssetComponent(props: Props): JSX.Element {
  const [asset, setAsset] = useState(props.asset ?? EMPTYASSET);
  const [image, setImage] = useState<string>();

  const [sending, setSending] = useState(false);

  const fileUpload = useRef<HTMLInputElement>(null);

  const isNew = asset.id === undefined;
  const hasChanged = JSON.stringify(asset) !== JSON.stringify(props.asset);

  useEffect(() => {
    if (props.asset !== undefined) return;
    setAsset({ ...EMPTYASSET });
  }, [props.asset, props.project.id]);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const target = e.target;
    const value = onChangeParser(target);
    setAsset({ ...asset, [target.name]: value });
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    const file = e.target.files?.item(0);
    if (!file) return;

    setImage(URL.createObjectURL(file));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSending(true);

    isNew ? await createAsset() : await updateAsset();

    setSending(false);
  };

  const updateAsset = async (): Promise<void> => {
    const id = asset.id;
    if (!id) return;

    const response = await submitJson(
      asset as unknown as Record<string, unknown>,
      `asset/${props.project.id}/${asset.id}`,
      "PATCH"
    );

    if (response.status !== 200)
      props.notify(response.message, "danger");
    else {

      // Put updated into local state.
      const updatedAsset = response.data as Asset;
      setAsset(updatedAsset);

      // Update project state.
      props.upsertAsset(updatedAsset);
      props.notify("Asset updated", "success");
    }
  };

  const createAsset = async (): Promise<void> => {
    // Post the data to the server.
    const response = await submitFormData(
      asset as unknown as Record<string, unknown>,
      `asset/${props.project.id}`,
      "POST"
    );

    if (response.status !== 200)
      props.notify(response.message, "danger");
    else {

      const newAsset = response.data as Asset;

      // Empty local state.
      setAsset(EMPTYASSET);
      setImage(undefined);

      // Update project state.
      props.upsertAsset(newAsset);
      props.notify("Asset created", "success");
    }
  };

  const deleteAsset = async (): Promise<void> => {
    const id = asset.id;
    if (!id) return;

    setSending(true);

    if (!confirm("Are you sure you want to delete this asset?")) return;
    const response = await submitUrl(`asset/${props.project.id}/${id}`, "DELETE");

    if (response.status !== 200)
      props.notify(response.message, "danger");
    else {
      props.notify("Asset deleted", "warning");
      props.deleteAsset(id);
    }

    setSending(false);
  };

  const makeBanner = async (): Promise<void> => {
    const id = asset.id;
    if (!id) return;

    setSending(true);

    const response = await submitUrl(`banner/${props.project.id}/${asset.id}`, "POST");

    if (response.status !== 200)
      props.notify(response.message, "danger");
    else {
      props.notify("Banner set", "success");
      props.setBanner(id);
    }

    setSending(false);
  };

  let iconSrc = undefined;

  if (!isNew)
    iconSrc = `url(${MEDIA}/content/${asset.id}.jpg)`;
  else if (asset.file !== undefined)
    iconSrc = `url(${image})`;

  return (
    <article className={styles.main} data-new={String(isNew)}>
      <form className={styles.form} onSubmit={onSubmit}>
        <h2>{isNew ? "New" : "Edit"} asset</h2>

        {isNew && (
          <input
            type="file"
            name="file"
            ref={fileUpload}
            onChange={onFileSelect}
            style={{ display: "none" }}
            required
          />
        )}

        <TextArea
          name="description"
          minLength={3}
          maxLength={128}
          rows={1}
          onChange={onChange}
          value={asset.description}
        />

        <TextArea
          name="alt"
          minLength={3}
          maxLength={128}
          rows={1}
          onChange={onChange}
          value={asset.alt}
        />

        <Checkbox name="is_displayed" onChange={onChange} value={asset.is_displayed} />

        <Checkbox name="is_pinned" onChange={onChange} value={asset.is_pinned} />

        <section className={styles.buttons}>
          {hasChanged &&
            <button type="submit" disabled={sending}>{isNew ? "Create" : "Update"}</button>
          }
          {!isNew &&
            <button type="button" disabled={sending} onClick={deleteAsset}>
              Delete
            </button>
          }
          {!isNew && props.project.banner_id !== asset.id &&
            <button type="button" disabled={sending} onClick={makeBanner}>
              Set banner
            </button>
          }
        </section>
      </form>
      <figure
        className={styles.image}
        style={{ backgroundImage: iconSrc }}
        onClick={
          isNew
            ? () => fileUpload.current?.click()
            : () => null
        }
      >
        {isNew && asset.file === undefined && "+"}
      </figure>
    </article>
  );

}

interface Props {
  asset?: AssetInput;
  project: ProjectInput;
  notify: (message: string, type: NotificationType) => void;
  upsertAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  setBanner: (id: string) => void;
}