import {
  AnchorHTMLAttributes,
  DetailedHTMLProps,
  ImgHTMLAttributes,
} from "react";
import Image from "next/image";
import Link from "next/link";

export const ResponsiveImage = (
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

export const LinkElement = (
  props: DetailedHTMLProps<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >
): JSX.Element => (
  <Link href={props.href as string}>
    <a target="_blank">{props.children}</a>
  </Link>
);