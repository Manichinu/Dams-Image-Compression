import { WebPartContext } from "@microsoft/sp-webpart-base";


export interface IAzureBlobProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  siteurl: string;
  context: WebPartContext;
}
