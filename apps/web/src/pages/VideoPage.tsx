import { ReelEditorShell } from "../features/reel-editor";
import { ViewType } from "../components/Sidebar";

interface VideoPageProps {
  setActiveView: (view: ViewType) => void;
}

export default function VideoPage({ setActiveView }: VideoPageProps) {
  return <ReelEditorShell setActiveView={setActiveView} />;
}


