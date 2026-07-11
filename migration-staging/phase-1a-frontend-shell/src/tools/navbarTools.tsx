import React from "react";
import {
  Briefcase,
  FileText,
  Folder,
  Gem,
  Globe,
  Home,
  Image,
  Palette,
  Phone,
  User,
  Video,
  WandSparkles,
} from "lucide-react";
import { ViewType } from "../components/Sidebar";

export interface NavbarTool {
  label: string;
  view: ViewType;
  icon: React.ReactNode;
  action?: () => void;
}

export const navbarTools: NavbarTool[] = [
  {
    label: "Home",
    view: "dashboard",
    icon: <Home size={16} />,
  },
  {
    label: "Projects",
    view: "projects",
    icon: <Folder size={16} />,
  },
  {
    label: "Studio",
    view: "studio",
    icon: <Palette size={16} />,
  },
  {
    label: "Templates",
    view: "flyer",
    icon: <FileText size={16} />,
  },
  {
    label: "Video",
    view: "video",
    icon: <Video size={16} />,
  },
  {
    label: "Gallery",
    view: "gallery",
    icon: <Image size={16} />,
  },
  {
    label: "Growth",
    view: "growth",
    icon: <Briefcase size={16} />,
  },
  {
    label: "Premium",
    view: "premium",
    icon: <Gem size={16} />,
  },
  {
    label: "Lang",
    view: "caption",
    icon: <Globe size={16} />,
  },
  {
    label: "Support",
    view: "support",
    icon: <Phone size={16} />,
  },
  {
    label: "Motion",
    view: "animation",
    icon: <WandSparkles size={16} />,
  },
  {
    label: "Login",
    view: "login",
    icon: <User size={16} />,
  },
];
