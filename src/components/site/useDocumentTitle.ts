import { useEffect } from "react";
import { company } from "@/content/company";

export const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} | ${company.shortName}` : `${company.shortName} | Engineering and construction in Uganda`;
  }, [title]);
};
