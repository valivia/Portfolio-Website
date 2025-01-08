import styles from "./markdown.module.scss";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { LinkElement, ResponsiveImage } from "./markdown_elements";

export type Markdown = MDXRemoteSerializeResult<Record<string, unknown>>;

export default function MarkdownComponent({ markdown }: Props): JSX.Element {
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
  markdown?: Markdown;
}