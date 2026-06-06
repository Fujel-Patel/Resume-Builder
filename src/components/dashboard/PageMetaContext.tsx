"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageMetaContextProps {
  title: string;
  breadcrumbs: Breadcrumb[];
  setTitle: (title: string) => void;
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
}

const PageMetaContext = createContext<PageMetaContextProps>({
  title: "Dashboard",
  breadcrumbs: [],
  setTitle: () => {},
  setBreadcrumbs: () => {},
});

export const PageMetaProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState<string>("Dashboard");
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

  return (
    <PageMetaContext.Provider value={{ title, breadcrumbs, setTitle, setBreadcrumbs }}>
      {children}
    </PageMetaContext.Provider>
  );
};

export const usePageMeta = () => useContext(PageMetaContext);
