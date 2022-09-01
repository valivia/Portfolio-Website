import {
  AnchorHTMLAttributes,
  Component,
  DetailedHTMLProps,
  ImgHTMLAttributes,
} from "react";
import styles from "./markdown.module.scss";
import Image from "next/image";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import Link from "next/link";

export default class Markdown extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { markdown: undefined };
  }

  componentDidMount = async (): Promise<void> => {
    const { value } = this.props;
    if (!value) return;
    const markdown = await serialize(value);
    this.setState({ markdown });
  };

  public render(): React.ReactNode {
    const { markdown } = this.state;
    if (!markdown) return null;

    return (
      <section className={styles.main}>
        <MDXRemote {...markdown} components={this.components} />
      </section>
    );
  }

  ResponsiveImage = (
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
  LinkElement = (
    props: DetailedHTMLProps<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >
  ): JSX.Element => (
    <Link href={props.href as string}>
      <a target="_blank">{props.children}</a>
    </Link>
  );

  components = {
    img: this.ResponsiveImage,
    a: this.LinkElement,
  };
}

interface Props {
  value: string | null;
}

interface State {
  markdown?: MDXRemoteSerializeResult<Record<string, unknown>>;
}
