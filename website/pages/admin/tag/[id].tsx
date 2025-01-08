import { GetServerSideProps } from "next";
import React, { useRef, useState } from "react";
import TextInput from "@components/input/text_input.module";
import Head from "next/head";
import styles from "./tag.module.scss";
import TextArea from "@components/input/textarea.module";
import Select from "@components/input/select.module";
import { useRouter } from "next/router";
import useTags from "data/use_tags";
import { submitJson, submitUrl } from "@components/submit";
import RangeInput from "@components/input/range.module";
import DateInput from "@components/input/date.module";
import onChangeParser from "@components/onchange";
import { TagInput } from "@typeFiles/api/tag.type";
import Project from "@typeFiles/api/project.type";
import AdminNavBar from "@components/admin/navbar.component";
import Cookies from "js-cookie";

// Notifications.
import { ReactNotifications, Store } from "react-notifications-component";
import NotificationType from "@typeFiles/notification";
import NotificationComponent from "@components/global/notification.module";
import "react-notifications-component/dist/theme.css";

const API = process.env.NEXT_PUBLIC_API_SERVER;

const EMPTYTAG: TagInput = {
  name: "",

  used_since: new Date().toISOString(),
  category: "Software",

};

function AdminTag(props: Props): JSX.Element {
  const router = useRouter();

  const { projects, categories } = props;
  const { tags, mutate, loggedOut } = useTags();

  const [icon, setIcon] = useState<Blob>();
  const [tag, setTag] = useState(props.tag);

  const [sending, setSending] = useState(false);

  const fileUpload = useRef<HTMLInputElement>(null);

  const isNew = tag.id === undefined;
  const hasChanged = JSON.stringify(tag) !== JSON.stringify(props.tag);

  if (loggedOut) {
    Cookies.remove("token");
    router.push("/login");
    return <></>;
  }

  const notify = (message: string, type: NotificationType) => {
    let duration = 5000;
    if (type === "success") duration = 2000;
    Store.addNotification({
      type,
      container: "bottom-right",
      content: NotificationComponent,
      message,
      animationIn: ["animate__animated", "animate__fadeIn"],
      animationOut: ["animate__animated", "animate__fadeOut"],
      dismiss: {
        duration,
      },
    });
  };

  function selectIcon(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (file === null) return;
    setIcon(file);
  }

  async function uploadIcon() {
    setSending(true);

    const response = await submitUrl(`tag/icon/${tag.id}`, "POST", icon);

    if (response.status !== 200) {
      notify(response.message, "danger");
    } else {
      const resultTag = response.data as TagInput;

      // Update state
      setIcon(undefined);
      setTag({ ...tag, icon_updated_at: resultTag.icon_updated_at });

      notify("Updated icon", "success");
    }

    setSending(false);
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
      response = await submitJson(
        data as Record<string, unknown>,
        "tag",
        "POST"
      );
    } else {
      response = await submitJson(
        data as Record<string, unknown>,
        `tag/${tag.id}`,
        "PATCH"
      );
    }

    if (response.status !== 200) {
      notify(response.message, "danger");
      setSending(false);
      return;
    }

    const resultTag = response.data as TagInput;

    if (isNew) {
      notify("Tag created", "success");
      router.replace(`/admin/tag/${resultTag.id}`);
    } else {
      notify("Tag updated", "success");
    }

    setTag(resultTag);
    setSending(false);
  }

  async function deleteTag() {
    mutate(
      tags.filter((x) => x.id !== tag.id),
      { populateCache: true, revalidate: false }
    );

    if (!confirm("Are you sure you want to delete this tag?")) return;

    if (tag.id === undefined) {
      setTag(props.tag);
      return;
    }

    const response = await submitUrl(`tag/${tag.id}`, "DELETE");

    if (response.status !== 200) notify(response.message, "danger");
    else await router.replace("/admin");
  }

  let iconSrc = undefined;
  if (tag.icon_updated_at && !icon)
    iconSrc = `${process.env.NEXT_PUBLIC_MEDIA_SERVER}/tag/${tag.id}.svg?last_updated=${Number(new Date(tag.icon_updated_at))}`;
  else if (icon) iconSrc = `${URL.createObjectURL(icon)}`;

  return (
    <>
      <Head>
        <title>{tag.name === "" ? "New Tag" : tag.name}</title>
        <meta name="theme-color" content="#B5A691" />
      </Head>

      <ReactNotifications />
      <AdminNavBar hasChanged={hasChanged} />

      <main className={styles.main}>

        {!isNew &&
          <img
            className={styles.icon}
            src={iconSrc}
            alt="+"
            onClick={() => fileUpload.current?.click()}
          />
        }

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <h1>{tag.name === "" ? "New" : tag.name}</h1>

          { /* USER INPUT */}
          <input
            type="file"
            name="icon"
            accept="image/svg+xml"
            ref={fileUpload}
            onChange={selectIcon}
            style={{ display: "none" }}
            required
          />

          <TextInput name="name" value={tag.name} onChange={onChange} />
          <TextInput name="website" value={tag.website} onChange={onChange} />
          <TextArea
            name="description"
            value={tag.description}
            onChange={onChange}
          />
          <Select
            name="project_id"
            text="notable project id"
            value={tag.notable_project}
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

        {/* BUTTONS */}
        <section>
          <section className={styles.buttons}>
            {hasChanged && (
              <button disabled={sending} onClick={() => submit()}>
                Submit
              </button>
            )}
            {icon && (
              <button disabled={sending} onClick={() => uploadIcon()}>
                Upload Icon
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

export default AdminTag;

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {

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

  // Fetch tag from API.
  const tag =
    (await fetch(`${API}/tag/${params?.id}`, headers)
      .then(async (data) => {
        if (!data.ok) return null;
        return (await data.json()).data as TagInput;
      })
      .catch(() => null)) ?? EMPTYTAG;

  // Fetch tag categories from API.
  const categories = await fetch(`${API}/enum/tag/category`, headers)
    .then(async (data) => {
      if (!data.ok) return [];
      return (await data.json()) as string[];
    })
    .catch(() => []);

  // Fetch all projects.
  const projects = await fetch(`${API}/project`, headers)
    .then(async (data) => {
      if (!data.ok) return [];
      return (await data.json()).data as Project[];
    })
    .catch(() => []);

  // Check if new tag.
  if (tag.id === "" && params?.id !== "new") return { notFound: true };

  return {
    props: { categories, projects, tag },
  };
};

interface Props {
  categories: string[];
  projects: Project[];
  tag: TagInput;
}