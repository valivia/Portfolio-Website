import { GetServerSideProps } from "next";
import Head from "next/head";
import React, { useState } from "react";
import { ProjectQuery } from "@typeFiles/api_project.type";
import styles from "./project.module.scss";
import { NextRouter, useRouter } from "next/router";
import prisma, { project_status, tag } from "@prisma/client";
import Link from "next/link";
import onChangeParser from "@components/onchange";
import { submitJson } from "@components/submit";
import Multiselector from "@components/admin_project/multiselector.module";
import TextInput from "@components/input/text_input.module";
import TextArea from "@components/input/textarea.module";
import Checkbox from "@components/input/checkbox.module";
import Markdown from "@components/admin_project/markdown.module";
import Asset from "@components/admin_project/asset.module";
import DateInput from "@components/input/date.module";
import Select from "@components/input/select.module";

const API = process.env.NEXT_PUBLIC_API_SERVER;
const EMPTYPROJECT: Project = {
  name: "",
  tags: [],
  assets: [],
  status: "",
  banner_id: null,
  created: new Date().toISOString(),
  description: null,
  markdown: null,
  pinned: false,
  projects: false,
  updated: new Date().toISOString(),
  uuid: "",
};

export default function AdminProject(props: Props): JSX.Element {
  const router = useRouter();
  const [project, setProject] = useState(props.project);
  const [sending, setSending] = useState(false);

  const isNew = project.uuid === "";
  const hasChanged = JSON.stringify(project) !== JSON.stringify(props.project);

  async function onChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const target = e.target;
    const value = onChangeParser(target);
    setProject({ ...project, [target.name]: value });
  }

  const multiselectorChange = (selected: { uuid: string; name: string }[]) => {
    setProject({ ...project, tags: selected });
  };

  const submit = async (): Promise<void> => {
    setSending(true);

    const submitData = project as unknown as SubmitProject;
    submitData.tags = project.tags.map((x) => x.uuid);

    const method = isNew ? "POST" : "PATCH";

    const response = await submitJson(
      submitData as unknown as Record<string, unknown>,
      "project",
      method
    );

    if (response.status !== 200) {
      alert(response.message || "Unknown error");
      setSending(false);
      return;
    }

    if (isNew) await router.push(`/admin/project/${project.uuid}`);
    else {
      setProject(response.data.project);
      alert("Project updated");
    }

    setSending(false);
  };

  const deleteProject = async (): Promise<void> => {
    setSending(true);
    if (!confirm("Are you sure you want to delete this project?")) return;
    if (isNew) {
      setProject(EMPTYPROJECT);
      return;
    }
    const response = await submitJson(
      { uuid: project.uuid },
      "project",
      "DELETE"
    );

    if (response.status !== 200) {
      alert(response.message || "Unknown error");
      setSending(false);
      return;
    }

    await router.push("/admin");
  };

  const confirmProceed = (event: { preventDefault: () => void }): void => {
    if (!hasChanged) return;

    if (confirm("Are you sure you want to proceed?")) return;
    event.preventDefault();
  };

  const upsertAsset = (asset: temp) => {
    const assets = project.assets.filter((x) => x.uuid !== asset.uuid);
    assets.unshift(asset);
    setProject({ ...project, assets });
  };

  const setBanner = (banner_id: string) => {
    setProject({ ...project, banner_id });
  };

  const deleteAsset = (id: string) => {
    const assets = project.assets.filter((x) => x.uuid !== id);
    setProject({ ...project, assets });
  };

  const render = (): JSX.Element => {
    return (
      <div className={styles.container}>
        <Head>
          <title>{project.name === "" ? "New Project" : project.name}</title>
          <meta name="theme-color" content="#B5A691" />
        </Head>

        <header className={styles.header}>
          <Link href="/admin">
            <a onClick={confirmProceed}>〈</a>
          </Link>
          <Link href={`/project/${project.uuid}`}>
            <a onClick={confirmProceed}>Project</a>
          </Link>
        </header>

        <main className={styles.main}>
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <h2>Project</h2>

            <TextInput name={"name"} value={project.name} onChange={onChange} />

            <TextArea
              name={"description"}
              value={project.description}
              onChange={onChange}
              maxLength={1024}
            />

            <DateInput
              name="created"
              onChange={onChange}
              value={new Date(project.created)}
            />

            <Select
              name="status"
              onChange={onChange}
              value={project.status || props.status[0]}
              list={props.status}
            />

            <section>
              <label>Tags:</label>
              <Multiselector
                options={props.tags}
                selected={project.tags || []}
                onChange={multiselectorChange}
              />
            </section>

            <section className={styles.checkbox}>
              <Checkbox
                name={"projects"}
                text={"Display on projects page?"}
                value={project.projects}
                onChange={onChange}
              />

              <Checkbox
                name={"pinned"}
                text={"Display as pinned?"}
                value={project.pinned}
                onChange={onChange}
              />
            </section>

            <section className={styles.buttons}>
              {hasChanged && (
                <button disabled={sending} onClick={submit}>
                  Submit
                </button>
              )}
              {(hasChanged || !isNew) && (
                <button onClick={deleteProject} disabled={sending}>
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
              <Asset
                key="new"
                project={project as unknown as ProjectQuery}
                upsertAsset={upsertAsset}
                deleteAsset={deleteAsset}
                setBanner={setBanner}
              />
              {project.assets.map((x) => (
                <Asset
                  key={x.uuid}
                  asset={x}
                  project={project as unknown as ProjectQuery}
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
            <Markdown value={project.markdown} />
          </section>
        </main>
      </div>
    );
  };

  return render();
}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  // Check auth. (this is fine i promiseeeeee (the actual api POST endpoints have proper auth))
  if (req.cookies.session === undefined) {
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
        return (await data.json()) as Project;
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
      return (await data.json()) as tag[];
    })
    .catch(() => []);

  if (project.status === "" && status.length !== 0) project.status = status[0];

  if (project.uuid === "" && params?.id !== "new") return { notFound: true };

  return {
    props: { tags, project, status },
  };
};

interface Props {
  router: NextRouter;
  tags: tag[];
  status: project_status[];
  project: Project;
}

interface Project
  extends Omit<
    ProjectQuery,
    "tags" | "status" | "created" | "updated" | "assets"
  > {
  status: string;
  created: string;
  updated: string;
  assets: temp[];
  tags: { uuid: string; name: string }[];
}
interface SubmitProject extends Omit<Project, "tags"> {
  tags: string[];
}

interface temp extends Omit<prisma.asset, "created"> {
  created: string;
}
