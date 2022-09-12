import prisma from "@prisma/client";
import { useEffect, useState } from "react";
import styles from "./asset.module.scss";
import onChangeParser from "../onchange";
import { ProjectQuery } from "@typeFiles/api_project.type";
import { submitFormData, submitJson } from "../submit";
import TextArea from "@components/input/textarea.module";
import Checkbox from "@components/input/checkbox.module";

const EMPTYASSET: Asset = {
  uuid: "",
  project_id: "",
  created: Date.now().toString(),
  alt: "",
  description: "",
  width: 0,
  height: 0,
  display: false,
  pinned: false,
  type: "audio",
};

export default function Asset(props: Props): JSX.Element {
  const [asset, setAsset] = useState(props.asset ?? EMPTYASSET);
  const [sending, setSending] = useState(false);

  const isNew = asset.uuid === "";
  const hasChanged = JSON.stringify(asset) !== JSON.stringify(props.asset);

  useEffect(() => {
    if (props.asset !== undefined) return;
    setAsset({ ...EMPTYASSET, project_id: props.project.uuid });
  }, [props.asset, props.project.uuid]);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const target = e.target;
    const value = onChangeParser(target);
    setAsset({ ...asset, [target.name]: value });
  };

  const submit = async (): Promise<void> => {
    setSending(true);

    isNew ? await createAsset() : await updateAsset();

    setSending(false);
  };

  const updateAsset = async (): Promise<void> => {
    const response = await submitJson(
      asset as unknown as Record<string, unknown>,
      "content",
      "PATCH"
    );

    if (response.status !== 200)
      return alert(response.message || "Unknown error");

    const updatedAsset = (await response.data.asset) as Asset;
    setAsset(updatedAsset);
    props.upsertAsset(updatedAsset);
    alert("Asset updated");
    return;
  };

  const createAsset = async (): Promise<void> => {
    const response = await submitFormData(
      asset as unknown as Record<string, unknown>,
      "content",
      "POST"
    );

    if (response.status !== 200)
      return alert(response.message || "Unknown error");

    const newAsset = (await response.data.asset) as Asset;
    setAsset(newAsset);
    props.upsertAsset(newAsset);
    alert("Asset created");
    return;
  };

  const deleteAsset = async (): Promise<void> => {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    const response = await submitJson(
      { uuid: asset.uuid },
      "content",
      "DELETE"
    );

    if (response.status !== 200) {
      alert(response.message || "Unknown error");
      return;
    }

    props.deleteAsset(asset.uuid);
  };

  const makeBanner = async (): Promise<void> => {
    const response = await submitJson(
      { asset: asset.uuid, project: props.project.uuid },
      "banner",
      "PATCH"
    );

    if (response.status !== 200) {
      alert(response.message || "Unknown error");
      return;
    }

    props.setBanner(asset.uuid);
  };

  function render(): JSX.Element {
    let iconSrc = undefined;
    if (!isNew)
      iconSrc = `url(${process.env.NEXT_PUBLIC_MEDIA_SERVER}/content/${asset.uuid}_medium.jpg)`;
    else if (asset.image !== undefined)
      iconSrc = `url(${URL.createObjectURL(asset.image)})`;

    return (
      <article className={styles.main} data-new={String(isNew)}>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <h2>{isNew ? "New" : "Edit"} asset</h2>

          {isNew && (
            <input
              type="file"
              name="image"
              onChange={onChange}
              style={{ display: "none" }}
            />
          )}

          <TextArea
            name="description"
            maxLength={128}
            rows={1}
            onChange={onChange}
            value={asset.description}
          />

          <TextArea
            name="alt"
            maxLength={128}
            rows={1}
            onChange={onChange}
            value={asset.alt}
          />

          <Checkbox name="display" onChange={onChange} value={asset.display} />

          <Checkbox name="pinned" onChange={onChange} value={asset.pinned} />

          <section className={styles.buttons}>
            {hasChanged && (
              <button onClick={submit}>{isNew ? "Create" : "Update"}</button>
            )}
            {!isNew && (
              <button onClick={deleteAsset} disabled={sending}>
                Delete
              </button>
            )}
            {!isNew && props.project.banner_id !== asset.uuid && (
              <button onClick={makeBanner} disabled={sending}>
                Set banner
              </button>
            )}
          </section>
        </form>
        <figure
          className={styles.image}
          style={{ backgroundImage: iconSrc }}
          onClick={
            isNew
              ? () => document.getElementsByName("image")[0]?.click()
              : () => null
          }
        >
          {isNew && asset.image === undefined && "+"}
        </figure>
      </article>
    );
  }

  return render();
}

interface Props {
  asset?: Asset;
  project: ProjectQuery;
  upsertAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  setBanner: (id: string) => void;
}

interface Asset extends Omit<prisma.asset, "created"> {
  image?: MediaSource;
  created: string;
}
