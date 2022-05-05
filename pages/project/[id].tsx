import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";

import React, { AnchorHTMLAttributes, DetailedHTMLProps, ImgHTMLAttributes, ReactNode } from "react";
import NavBar from "../../components/navbar";

import styles from "../../styles/project.module.scss";
import { ProjectQuery } from "../../types/types";

import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Footer from "../../components/footer.module";
import Tags from "../../components/tags.module";
import AssetGallery from "../../components/assetGallery.module";
import Link from "next/link";

const api = process.env.NEXT_PUBLIC_API_SERVER;
const mediaServer = process.env.NEXT_PUBLIC_MEDIA_SERVER;

export default class Projects extends React.Component<ProjectQuery, never> {
  private scroll() {
    document.getElementById("main")?.scrollIntoView({ behavior: "smooth" });
  }

  ResponsiveImage = (props: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>): JSX.Element => {
    if (props.src?.endsWith(".mp4")) {
      return (<video controls><source src={props.src} type="video/mp4" /></video>);
    }
    return (<Image alt={props.alt} layout="fill" src={props.src as string} />);
  }
  LinkElement = (props: DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>): JSX.Element => (<Link href={props.href as string}><a target="_blank">{props.children}</a></Link>);


  components = {
    img: this.ResponsiveImage,
    a: this.LinkElement,
  }

  render(): ReactNode {
    const { assets, tags } = this.props;
    const project = this.props;
    const banner = assets.find(asset => asset.uuid === project.banner_id);
    const markdown = this.props.markdown as MDXRemoteSerializeResult<Record<string, unknown>> | null;

    return (
      <>
        <Head>
          <title>{project.name}</title>
          <meta name="theme-color" content="#B5A691" />
          <meta name="description" content={project.description || ""}></meta>
        </Head>
        <NavBar />
        {
          banner ?
            <header className={styles.header} style={{ backgroundImage: `url("${mediaServer}/content/${banner?.uuid}_high.jpg")` }}>
              <p onClick={this.scroll}>﹀</p>
            </header>
            : <header className={styles.spacer}></header>
        }
        <article className={styles.content} id="main">
          <header><h1>{project.name}</h1></header>
          <section className={styles.info}>
            <Tags tags={tags} clickable={true} />
            <table>
              <tr>
                <td>Name</td>
                <td>{project.name}</td>
              </tr>
              <tr>
                <td>Status</td>
                <td>{project.status}</td>
              </tr>
              <tr>
                <td>Asset count</td>
                <td>{project.assets.length}</td>
              </tr>
              <tr>
                <td>Last updated</td>
                <td>{new Date(project.updated).toDateString()}</td>
              </tr>
              <tr>
                <td>Created</td>
                <td>{new Date(project.created).toDateString()}</td>
              </tr>
            </table>
          </section>


          {(markdown || project.description) ?
            <section className={styles.markdown}>
              {markdown ? <MDXRemote {...markdown} components={this.components} /> : project.description}
            </section>

            : ""
          }

          {assets.length > 0 ?
            <section className={styles.assets}>
              <header><h2>Gallery</h2></header>
              <AssetGallery assets={assets} />
            </section>
            : <></>
          }

        </article>
        <Footer />
      </>
    );
  }

}


export const getStaticPaths: GetStaticPaths = async () => {
  const res = await fetch(`${api}/project`, { headers: { authorization: process.env.CLIENT_SECRET as string } });
  const data = await res.json() as ProjectQuery[];

  const paths = data.map((project) => { return { params: { id: project.uuid } }; });

  return {
    paths: paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const res = await fetch(`${api}/project/${params?.id}`, { headers: { authorization: process.env.CLIENT_SECRET as string } })
    .then(x => {
      if (x.ok) return x;
      else return false;
    });

  if (!res) {
    return {
      notFound: true,
    };
  }

  const data = await res.json() as ProjectQuery;
  data.markdown ? data.markdown = await serialize(data.markdown as string) as unknown as string : null;

  return {
    props: data,
  };
};
