import { LoginView } from "../components/LoginView";
import { ViewType } from "../components/Sidebar";

type LoginPageProps = {
  setActiveView: (view: ViewType) => void;
  triggerToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
};

export default function LoginPage(props: LoginPageProps) {
  return <LoginView {...props} />;
}


