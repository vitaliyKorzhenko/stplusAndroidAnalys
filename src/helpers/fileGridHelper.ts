import { PresenceBadgeStatus } from "@fluentui/react-components";

export type FileCell = {
    id: number;
    label: string;
    icon: JSX.Element;
  };
  
  export type LastUpdatedCell = {
    label: string;
    timestamp: number;
  };
  
  export type AuthorCell = {
    label: string;
    status: PresenceBadgeStatus;
  };
  
  export type FileSizeCell = {
    label: string;
    size: number;
  };
  
  export type Item = {
    file: FileCell;
    author: AuthorCell;
    lastUpdated: LastUpdatedCell;
    fileSize?: FileSizeCell;
  
  };


export function parseSizeToMbLabel(size: number | null | undefined): string {
    if (!size) {
      return "0 MB";
    }
    return `${(size / 1024).toFixed(2)} MB`;
  }