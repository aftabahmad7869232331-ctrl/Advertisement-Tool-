import { ProjectAsset } from "../types";

export type ThemeName = "Brick Gold" | "Midnight Black" | "Royal Purple" | "Ocean Blue" | "Emerald Green" | string;
export type CategoryName = string;
export type ProjectTypeName = string;
export type OutputFormatName = "PDF" | "PNG" | "JPG" | "Print Ready" | "Web Ready" | string;
export type Priority = "Low" | "Medium" | "High";
export type ProjectStatus = "Pending" | "Completed" | "In Progress" | "Not Started" | "On Hold" | "Archived";

export interface Project {
  id: string;
  priority: Priority;
  createdAt: string;
  name: string;
  description: string;
  category: CategoryName;
  projectType: ProjectTypeName;
  language: string;
  theme: ThemeName;
  targetAudience: string;
  deadline: string;
  outputFormat: OutputFormatName;
  status: ProjectStatus;
  isPinned: boolean;
  assets: ProjectAsset[];
}


