import { GetServerSideProps } from "next";
import React, { useState } from "react";
import TextInput from "@components/input/text_input.module";
import Head from "next/head";
import styles from "./tag.module.scss";
import TextArea from "@components/input/textarea.module";
import Select from "@components/input/select.module";
import { project, tag as tagType } from "@prisma/client";
import { useRouter } from "next/router";
import useTags from "data/use_tags";
import { submitFormData, submitJson } from "@components/submit";
import RangeInput from "@components/input/range.module";
import DateInput from "@components/input/date.module";
import onChangeParser from "@components/onchange";

const API = process.env.NEXT_PUBLIC_API_SERVER;

const EMPTYTAG: Tag = {
  created: new Date().toISOString(),
  uuid: "",
  name: "",
  icon: null,
  description: null,
  website: null,
  score: null,
  used_since: new Date().toISOString(),
  project_uuid: null,
  category: "software",
};

function AdminTag(props: Props): JSX.Element {
  const router = useRouter();

  const { projects, categories } = props;
  const { tags, mutate, loggedOut } = useTags();
  const [tag, setTag] = useState(props.tag);
  const [sending, setSending] = useState(false);

  const isNew = tag.uuid === "";
  const hasChanged = JSON.stringify(tag) !== JSON.stringify(props.tag);

  if (loggedOut) {
    router.push("/login");
    return <></>;
  }

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const value = onChangeParser(target);
    setTag({ ...tag, [target.name]: value });
  };

  async function submit() {
    setSending(true);

    const data = { ...tag };

    let response;
    if (isNew) {
      response = await submitFormData(
        data as Record<string, unknown>,
        "tag",
        "POST"
      );
    } else {
      response = await submitJson(
        data as Record<string, unknown>,
        "tag",
        "PATCH"
      );
    }

    if (response.status !== 200) {
      alert(response.message || "Unknown error");
      setSending(false);
      return;
    }

    const result = response.data.tag as Tag;

    if (isNew) {
      alert("Project created");
      router.push(`/admin/tag/${result.uuid}`);
      return;
    } else {
      setTag(result);
      alert("Project updated");
    }

    setSending(false);
  }

  async function deleteTag() {
    mutate(
      tags.filter((x) => x.uuid !== tag.uuid),
      { populateCache: true, revalidate: false }
    );

    if (!confirm("Are you sure you want to delete this tag?")) return;
    if (tag.uuid === "") {
      setTag(props.tag);
      return;
    }

    const response = await submitJson({ uuid: tag.uuid }, `/tag`, "DELETE");

    if (response.status !== 200) return;

    await router.push("/admin");
  }

  function render() {
    let iconSrc = undefined;
    if (!isNew)
      iconSrc = `${process.env.NEXT_PUBLIC_MEDIA_SERVER}/icon/${tag.uuid}.svg`;
    else if (tag.icon !== null) iconSrc = `${URL.createObjectURL(tag.icon)}`;

    return (
      <>
        <Head>
          <title>{tag.name === "" ? "New Tag" : tag.name}</title>
          <meta name="theme-color" content="#B5A691" />
        </Head>
        <main className={styles.main}>
          <img
            className={styles.icon}
            src={iconSrc}
            alt="Icon"
            onClick={
              isNew
                ? () => document.getElementsByName("icon")[0]?.click()
                : () => null
            }
          />
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <h1>{tag.name === "" ? "New" : tag.name}</h1>
            {isNew && (
              <input
                type="file"
                name="icon"
                accept="image/svg+xml"
                onChange={onChange}
                style={{ display: "none" }}
                required
              />
            )}

            <TextInput name="name" value={tag.name} onChange={onChange} />
            <TextInput name="website" value={tag.website} onChange={onChange} />
            <TextArea
              name="description"
              value={tag.description}
              onChange={onChange}
            />
            <Select
              name="project_uuid"
              text="notable project uuid"
              value={tag.project_uuid}
              onChange={onChange}
              list={projects ?? []}
              datalist={true}
            />

            <RangeInput
              name="score"
              text="Experience"
              value={tag.score ? Number(tag.score) : 0}
              onChange={onChange}
              min={0}
              max={100}
            />

            <Select
              name="category"
              value={tag.category}
              onChange={onChange}
              list={categories}
            />

            <DateInput
              name="used_since"
              text="Used since"
              value={new Date(tag.used_since)}
              onChange={onChange}
            />
          </form>

          <section>
            <section className={styles.buttons}>
              {hasChanged && (
                <button disabled={sending} onClick={() => submit()}>
                  Submit
                </button>
              )}
              {(hasChanged || !isNew) && (
                <button disabled={sending} onClick={deleteTag}>
                  Delete
                </button>
              )}
            </section>
          </section>
        </main>
      </>
    );
  }

  return render();
}

export default AdminTag;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const headers = {
    headers: { authorization: process.env.CLIENT_SECRET as string },
  };

  const tag =
    (await fetch(`${API}/tag/${params?.id}`, headers)
      .then(async (data) => {
        if (!data.ok) return null;
        return (await data.json()) as Tag;
      })
      .catch(() => null)) ?? EMPTYTAG;

  const categories = await fetch(`${API}/enum/tag/category`, headers)
    .then(async (data) => {
      if (!data.ok) return [];
      return (await data.json()) as string[];
    })
    .catch(() => []);

  const projects = await fetch(`${API}/project`, headers)
    .then(async (data) => {
      if (!data.ok) return [];
      return (await data.json()) as project[];
    })
    .catch(() => []);

  if (tag.uuid === "" && params?.id !== "new") return { notFound: true };

  return {
    props: { categories, projects, tag },
  };
};

interface Props {
  categories: string[];
  projects: project[];
  tag: Tag;
}

interface Tag extends Omit<tagType, "created" | "used_since"> {
  icon: Blob | null;
  created: string;
  used_since: string;
}
