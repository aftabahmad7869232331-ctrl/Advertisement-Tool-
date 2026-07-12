import { AdsView } from "../components/AdsView";
import type { Campaign } from "../types";

export interface TemplatesPageProps {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  onSaveCampaign: (campaign: Campaign) => void;
  onSelectCampaign: (campaign: Campaign | null) => void;
  triggerToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
}

export default function TemplatesPage(props: TemplatesPageProps) {
  return <AdsView {...props} />;
}
