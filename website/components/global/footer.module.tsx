import styles from "./footer.module.scss";
import { IoLogoInstagram, IoMailOutline, IoLogoGithub, IoLogoTwitter, IoLogoPaypal } from "react-icons/io5";
import { GiCannedFish } from "react-icons/gi";
import { FaDiscord } from "react-icons/fa";
import { SiKofi } from "react-icons/si";

const MAIL = process.env.NEXT_PUBLIC_MAIL;
const DISCORD = process.env.NEXT_PUBLIC_DISCORD;

const GITHUB = process.env.NEXT_PUBLIC_GITHUB;
const INSTA = process.env.NEXT_PUBLIC_INSTAGRAM;
const TWITTER = process.env.NEXT_PUBLIC_TWITTER;

const PAYPAL = process.env.NEXT_PUBLIC_PAYPAL;
const KOFI = process.env.NEXT_PUBLIC_KOFI;

const MEDIA = process.env.NEXT_PUBLIC_MEDIA_SERVER;

export default function Footer(): JSX.Element {


  return (
    <footer className={styles.main}>

      {(INSTA || TWITTER || GITHUB) &&
        <section>
          <span>Socials</span>
          {INSTA &&
            <a
              href={INSTA}
              target="_blank"
              rel="noreferrer"
            >

              <IoLogoInstagram /> Instagram
            </a>
          }

          {TWITTER &&
            <a
              href={TWITTER}
              target="_blank"
              rel="noreferrer"
            >
              <IoLogoTwitter /> Twitter
            </a>
          }

          {GITHUB &&
            <a
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
            >
              <IoLogoGithub /> Github
            </a>
          }
        </section>
      }

      {(MAIL || DISCORD) &&
        <section>
          <span>Contact</span>
          {MAIL &&
            <a
              href={MAIL}
              target="_blank"
              rel="noreferrer"
            >
              <IoMailOutline /> Mail
            </a>
          }

          {DISCORD &&
            <a
              href={DISCORD}
              target="_blank"
              rel="noreferrer"
            >
              <FaDiscord /> Discord
            </a>
          }

        </section>
      }


      {(PAYPAL || KOFI) &&
        <section>
          <span>support</span>

          {PAYPAL &&
            <a
              href={PAYPAL}
              target="_blank"
              rel="noreferrer"
            >
              <IoLogoPaypal /> Paypal
            </a>
          }

          {KOFI &&
            <a
              href={KOFI}
              target="_blank"
              rel="noreferrer"
            >
              <SiKofi /> Ko-fi
            </a>
          }

          <a
            href={`${MEDIA}/video/sad.mp4`}
            target="_blank"
            rel="noreferrer"
          >
            <GiCannedFish /> Beans
          </a>

        </section>
      }

    </footer >
  );
}