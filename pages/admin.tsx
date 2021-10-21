import { Tags } from ".prisma/client";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import AuthSwr from "../lib/auth.swr";
import styles from "../styles/admin.module.scss";
import form from "../styles/contact.module.scss";
import { GalleryImage } from "../types/types";
import NotFound from "./404";

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

export default function Browse({ projects, tags }: { projects: GalleryImage[], tags: Tags[] }): JSX.Element {

  const { loading, loggedOut } = AuthSwr();


  if (loggedOut) return <NotFound />;
  if (loading) return <></>;

  return (
    <>
      <Head>
        <title>admin panel</title>
        <meta name="theme-color" content="#B5A691" />
        <meta name="description" content="Admin panel" />
      </Head>

      <main className={styles.main}>
        <form className={form.form} action={`${cdn}/project`} method="POST" encType="multipart/form-data">
          <h2>New project</h2>
          <div>
            <label>Name:</label>
            <input className={form.input} type="text" id="name" name="Name" />
          </div>

          <div>
            <label>Image</label>
            <input className={form.input} type="file" name="Banner" />
          </div>

          <div>
            <label>Alt-text:</label>
            <textarea className={form.input} name="Alt" maxLength={128} rows={1}></textarea>
          </div>

          <div>
            <label>Description:</label>
            <textarea className={form.input} name="Description" maxLength={1024}></textarea>
          </div>

          <div>
            <label>Status:</label>
            <select className={form.input} name="Status">
              <option value="Unknown">Unknown</option>
              <option value="Abandoned">Abandoned</option>
              <option value="In_Progress">In progress</option>
              <option value="Finished">Finished</option>
            </select>
          </div>

          <div>
            <label>tag:</label>
            <select className={form.input} name="Tags" multiple>
              {tags.map(data => <option key={data.TagID} value={data.TagID}>{data.Name}</option>)}
            </select>
          </div>

          <div>
            <input className={form.submit} type="submit" value="Submit!" />
          </div>
        </form>

        <form className={form.form} action={`${cdn}/content`} method="POST" encType="multipart/form-data">
          <h2>Add content</h2>
          <div>
            <label>Project</label>
            <select className={form.input} name="ID">
              {projects.map(data => <option key={data.ID} value={data.ID}>{data.ID} - {data.Name}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="Image">Image</label>
            <input className={form.input} type="file" name="Image" />
          </div>

          <div>
            <label>Alt-text:</label>
            <textarea className={form.input} name="Alt" maxLength={128} rows={1}></textarea>
          </div>

          <div>
            <label>Description:</label>
            <textarea className={form.input} name="Description" maxLength={1024}></textarea>
          </div>

          <div>
            <label>Display in gallery?</label>
            <input type="checkbox" name="Display" />
          </div>

          <div>
            <input className={form.submit} type="submit" value="Submit!" />
          </div>
        </form>

        <form className={form.form} action={`${cdn}/delete`} method="POST">
          <h2>Remove project</h2>
          <div>
            <label htmlFor="ID">Project</label>
            <select className={form.input} name="ID">
              {projects.map(data => <option key={data.ID} value={data.ID}>{data.ID} - {data.Name}</option>)}
            </select>
          </div>

          <div>
            <input className={form.submit} type="submit" value="Submit!" />
          </div>
        </form>
      </main>
    </>
  );

}


export const getServerSideProps: GetServerSideProps = async () => {
  const projectData = await fetch(`${cdn}/project`, { headers: { authorization: process.env.CLIENT_SECRET as string } });
  const projects = await projectData.json() as GalleryImage[];

  const tagData = await fetch(`${cdn}/tags`, { headers: { authorization: process.env.CLIENT_SECRET as string } });
  const tags = await tagData.json() as GalleryImage[];

  if (!projects || !tags) {
    return {
      notFound: true,
    };
  }

  return {
    props: { projects, tags },
  };
};