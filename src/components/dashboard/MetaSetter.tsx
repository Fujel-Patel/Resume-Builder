"use client";

import { useEffect } from "react";
import { usePageMeta } from "./PageMetaContext";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface Props {
  title: string;
  breadcrumbs: Breadcrumb[];
}

export default function MetaSetter({ title, breadcrumbs }: Props) {
  const { setTitle, setBreadcrumbs } = usePageMeta();

  useEffect(() => {
    setTitle(title);
    setBreadcrumbs(breadcrumbs);
  }, [title, breadcrumbs, setTitle, setBreadcrumbs]);

  return null;
}
