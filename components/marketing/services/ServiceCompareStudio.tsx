"use client";
import dynamic from "next/dynamic";
import { Layers3 } from "lucide-react";
import { useState } from "react";
import type { SmmService } from "@/lib/smm-service-catalog";
import styles from "./ServicesCatalog.module.css";

const ServiceCompareDialog = dynamic(() => import("./ServiceCompareDialog"), { ssr: false });

export default function ServiceCompareStudio({ serviceCatalog }: { serviceCatalog: SmmService[] }) {
  const [open, setOpen] = useState(false);
  const [activated, setActivated] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const selectedCount = serviceCatalog.filter(service => selectedCodes.includes(service.code)).length;
  return <>
    <button type="button" className={styles.secondary} title="Compare services" onClick={() => { setActivated(true); setOpen(true); }} aria-haspopup="dialog" aria-expanded={open}><Layers3 size={16} aria-hidden="true" /><span className="sr-only sm:not-sr-only">Compare services</span>{selectedCount > 0 && <span>({selectedCount})</span>}</button>
    {activated && <ServiceCompareDialog serviceCatalog={serviceCatalog} open={open} onClose={() => setOpen(false)} selectedCodes={selectedCodes} setSelectedCodes={setSelectedCodes} />}
  </>;
}
