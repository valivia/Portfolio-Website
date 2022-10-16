import styles from "./notification.module.scss";
import { iNotification } from "react-notifications-component";

export default function NotificationComponent({ id, notificationConfig }: Props): JSX.Element {
  return (
    <article key={id} className={styles.main}>
      <div className={styles.status} data-type={notificationConfig.type}></div>
      <main>{notificationConfig.message}</main>
      <button className={styles.close} onClick={() => notificationConfig.onRemoval && notificationConfig.onRemoval(id, "click")}>&times;</button>
    </article>
  );
}

interface Props {
  notificationConfig: iNotification;
  id: string;
}