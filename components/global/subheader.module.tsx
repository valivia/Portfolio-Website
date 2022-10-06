import styles from "./subheader.module.scss";
import Image, { StaticImageData } from "next/image";


export default function SubHeaderComponent(props: Props): JSX.Element {
  return (
    <header className={styles.main} >
      <section className={styles.content}>
        {props.children}
      </section>

      <div className={styles.image}>
        <Image
          src={props.image}
          alt={props.alt}
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          quality={100}
        />
      </div>
    </ header>
  );
}

interface Props {
  image: StaticImageData;
  alt?: string;
  children?: JSX.Element[];
}