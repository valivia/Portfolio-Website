import { GetServerSideProps } from "next";
import Head from "next/head";
import React, { useState } from "react";
import styles from "./project.module.scss";
import { NextRouter, useRouter } from "next/router";
import onChangeParser from "@components/onchange";
import { submitJson, submitUrl } from "@components/submit";
import MultiselectorInput from "@components/admin/project/multiselector.module";
import TextInput from "@components/input/text_input.module";
import TextArea from "@components/input/textarea.module";
import Checkbox from "@components/input/checkbox.module";
import MarkdownComponent from "@components/global/markdown.module";
import AdminPageAssetComponent from "@components/admin/project/asset.module";
import DateInput from "@components/input/date.module";
import Select from "@components/input/select.module";
import { ProjectInput } from "@typeFiles/api/project.type";
import Tag from "@typeFiles/api/tag.type";
import Asset from "@typeFiles/api/asset.type";
import AdminNavBar from "@components/admin/navbar.component";

// Notifications.
import { ReactNotifications, Store } from "react-notifications-component";
import NotificationType from "@typeFiles/notification";
import NotificationComponent from "@components/global/notification.module";
import "react-notifications-component/dist/theme.css";

const API = process.env.NEXT_PUBLIC_API_SERVER;
const EMPTYPROJECT: ProjectInput = {
  name: "",
  tags: [],
  assets: [],
  status: "Finished",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),

  is_pinned: false,
  is_project: false,
};

export default function AdminProject(props: Props): JSX.Element {
  const router = useRouter();
  const [project, setProject] = useState(props.project);
  const [sending, setSending] = useState(false);

  const isEqualState = (): boolean => {
    const propProject = props.project;
    const stateProject = project;

    if (propProject.created_at !== stateProject.created_at) return false;
    if (propProject.name !== stateProject.name) return false;
    if (propProject.description !== stateProject.description) return false;
    if (propProject.markdown !== stateProject.markdown) return false;

    if (propProject.status !== stateProject.status) return false;
    if (propProject.is_project !== stateProject.is_project) return false;
    if (propProject.is_pinned !== stateProject.is_pinned) return false;

    if (propProject.tags !== stateProject.tags) return false;


    return true;
  };

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const value = onChangeParser(target);
    setProject({ ...project, [target.name]: value });
  };

  const multiselectorChange = (selected: { id: string; name: string }[]) => {
    setProject({ ...project, tags: selected });
  };

  const notify = (message: string, type: NotificationType) => {
    let duration = 5000;
    if (type === "success") duration = 2000;
    Store.addNotification({
      type,
      container: "top-right",
      content: NotificationComponent,
      message,
      animationIn: ["animate__animated", "animate__fadeIn"],
      animationOut: ["animate__animated", "animate__fadeOut"],
      dismiss: {
        duration,
      },
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    setSending(true);

    const submitData = { ...project } as unknown as Record<string, unknown>;
    submitData.tags = project.tags.map((x) => x.id);

    const method = isNew ? "POST" : "PATCH";
    const path = isNew ? "project" : `project/${submitData.id}`;

    const response = await submitJson(
      submitData,
      path,
      method
    );

    if (response.status !== 200) {
      notify(response.message, "danger");
    } else if (isNew) {
      await router.replace(`/admin/project/${response.data.id}`);
    } else {
      notify("Project updated", "success");
    }
    setProject(response.data);
    setSending(false);
  };

  const deleteProject = async (): Promise<void> => {
    setSending(true);
    if (!confirm("Are you sure you want to delete this project?")) return;

    if (isNew) {
      setProject(EMPTYPROJECT);
      return;
    }
    const response = await submitUrl(
      `project/${project.id}`,
      "DELETE"
    );

    if (response.status !== 200) {
      notify(response.message, "danger");
      setSending(false);
    } else {
      await router.push("/admin");
    }
  };

  const upsertAsset = (input: Asset) => {
    setProject((old) => {
      const assets = old.assets.concat([]);
      const currentId = assets.findIndex(x => x.id == input.id);

      if (currentId === -1) assets.unshift(input);
      else assets[currentId] = input;

      return { ...old, assets };
    });
  };

  const setBanner = (banner_id: string) => {
    setProject({ ...project, banner_id });
  };

  const deleteAsset = (id: string) => {
    setProject((old) => (
      { ...old, assets: old.assets.filter((asset) => asset.id !== id) }
    ));
  };

  const isNew = project.id === undefined;
  const hasChanged = !isEqualState();

  return (
    <div className={styles.container}>
      <Head>
        <title>{project.name === "" ? "New Project" : project.name}</title>
        <meta name="theme-color" content="#B5A691" />
      </Head>

      <ReactNotifications />
      <AdminNavBar path={project.id && `/project/${project.id}`} hasChanged={hasChanged} />

      <main className={styles.main}>
        <form className={styles.form} onSubmit={onSubmit}>
          <h2>Project</h2>

          <TextInput name={"name"} value={project.name} onChange={onChange} />

          <TextArea
            name={"description"}
            value={project.description}
            onChange={onChange}
            minLength={3}
            maxLength={1024}
          />

          <DateInput
            name="created"
            onChange={onChange}
            value={new Date(project.created_at)}
          />

          <Select
            name="status"
            onChange={onChange}
            value={project.status || props.status[0]}
            list={props.status}
          />

          <section>
            <label>Tags:</label>
            <MultiselectorInput
              options={props.tags}
              active={project.tags || []}
              onChange={multiselectorChange}
            />
          </section>

          <section className={styles.checkbox}>
            <Checkbox
              name={"is_project"}
              text={"Display on projects page?"}
              value={project.is_project}
              onChange={onChange}
            />

            <Checkbox
              name={"is_pinned"}
              text={"Display as pinned?"}
              value={project.is_pinned}
              onChange={onChange}
            />
          </section>

          <section className={styles.buttons}>
            {hasChanged && (
              <button type="submit" disabled={sending} >
                {isNew ? "Create" : "Update"}
              </button>
            )}
            {(hasChanged || !isNew) && (
              <button type="button" onClick={deleteProject} disabled={sending}>
                Delete
              </button>
            )}
          </section>
        </form>

        {!isNew && (
          <section className={styles.assets}>
            <header>
              <h2>Assets</h2>
            </header>
            <AdminPageAssetComponent
              key="new"
              project={project}
              notify={notify}
              upsertAsset={upsertAsset}
              deleteAsset={deleteAsset}
              setBanner={setBanner}
            />
            {project.assets.map((x) => (
              <AdminPageAssetComponent
                key={x.id}
                asset={x}
                project={project}
                notify={notify}
                upsertAsset={upsertAsset}
                deleteAsset={deleteAsset}
                setBanner={setBanner}
              />
            ))}
          </section>
        )}

        <section className={styles.markdownInput}>
          <h2>Markdown</h2>
          <textarea
            name="markdown"
            value={project.markdown || ""}
            onChange={onChange}
          ></textarea>
        </section>

        <section className={styles.markdown}>
          <h2>Rendered Markdown</h2>
          <MarkdownComponent markdownString={project.markdown} />
        </section>
      </main>
    </div>
  );


}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  // Check auth. (this is fine i promiseeeeee (the actual api POST endpoints have proper auth))
  if (req.cookies.token === undefined) {
    return {
      redirect: {
        destination: "/login",
        permanent: true,
      },
    };
  }

  const headers = {
    headers: { authorization: process.env.CLIENT_SECRET as string },
  };

  const project =
    (await fetch(`${API}/project/${params?.id}`, headers)
      .then(async (data) => {
        if (!data.ok) return null;
        return (await data.json()).data as ProjectInput;
      })
      .catch(() => null)) ?? EMPTYPROJECT;

  const status = await fetch(`${API}/enum/project/status`, headers)
    .then(async (data) => {
      if (!data.ok) return [];
      return (await data.json()) as string[];
    })
    .catch(() => []);

  const tags = await fetch(`${API}/tag`, headers)
    .then(async (data) => {
      if (!data.ok) return [];
      return (await data.json()).data as Tag[];
    })
    .catch(() => []);

  if (project.status === "" && status.length !== 0) project.status = status[0];

  if (!project.id && params?.id !== "new") return { notFound: true };

  return {
    props: { tags, project, status },
  };
};

interface Props {
  router: NextRouter;
  tags: Tag[];
  status: string[];
  project: ProjectInput;
}