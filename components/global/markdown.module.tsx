import {
  AnchorHTMLAttributes,
  DetailedHTMLProps,
  ImgHTMLAttributes,
  useEffect,
  useState,
} from "react";
import styles from "./markdown.module.scss";
import Image from "next/image";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import Link from "next/link";

type Markdown = MDXRemoteSerializeResult<Record<string, unknown>>;

export default function MarkdownComponent({ markdownString }: Props): JSX.Element {
  const [markdown, setMarkdown] = useState<Markdown>();

  useEffect(() => {
    if (!markdownString) return;
    serialize(markdownString).then(parsed => setMarkdown(parsed)).catch(() => null);
  }, [markdownString]);

  const ResponsiveImage = (
    props: DetailedHTMLProps<
      ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >
  ): JSX.Element => {
    if (props.src?.endsWith(".mp4")) {
      return (
        <video controls>
          <source src={props.src} type="video/mp4" />
        </video>
      );
    }
    return <Image alt={props.alt} layout="fill" src={props.src as string} />;
  };

  const LinkElement = (
    props: DetailedHTMLProps<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >
  ): JSX.Element => (
    <Link href={props.href as string}>
      <a target="_blank">{props.children}</a>
    </Link>
  );

  const components = {
    img: ResponsiveImage,
    a: LinkElement,
  };


  if (!markdown) return <></>;

  return (
    <section className={styles.main}>
      <MDXRemote {...markdown} components={components} />
    </section>
  );
}

interface Props {
  markdownString?: string | null;
}