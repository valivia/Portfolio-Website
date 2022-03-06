import Link from "next/link";
import Image from "next/image";

export function ResponsiveImage(props: any): JSX.Element {
  console.log(props);
  return (<Image alt={props.alt} layout="fill" {...props} />);
}

export function LinkElement(props: any): JSX.Element {
  console.log(props);
  return (<Link href={props.href} passHref={true}>a</Link >);
}

export const components = {
  img: ResponsiveImage,
  a: LinkElement,
};