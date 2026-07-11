import type { Campaign } from "../../types";

export interface HomeToolPageProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onNavigateToCreate: () => void;
  onToggleStatus: (id: string) => void;
}
