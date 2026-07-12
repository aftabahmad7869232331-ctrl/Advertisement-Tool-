import { StudioView } from "../components/StudioView";
import { ViewType } from "../components/Sidebar";

type StudioPageProps = {
  setActiveView: (view: ViewType) => void;
};

export default function StudioPage(props: StudioPageProps) {
  return <StudioView {...props} />;
}
