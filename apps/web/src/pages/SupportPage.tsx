import { SupportView } from "../components/SupportView";

type SupportPageProps = {
  triggerToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
};

export default function SupportPage(props: SupportPageProps) {
  return <SupportView {...props} />;
}


