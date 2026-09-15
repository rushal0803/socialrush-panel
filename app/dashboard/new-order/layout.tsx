import type { ReactNode } from "react";
import styles from "./phase6-order.module.css";

export default function NewOrderLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div className={styles.phase6Shell}>{children}</div>;
}
