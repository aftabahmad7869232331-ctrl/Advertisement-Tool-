import { Download, FolderPlus, Layers3, Pencil, Printer, RefreshCw } from "lucide-react";

const actions = [[FolderPlus, "Save Project"], [Download, "Download"], [Printer, "Print"], [Pencil, "Edit"], [RefreshCw, "Regenerate"], [Layers3, "Variations"]] as const;

export function ResultActions({ onAction }: { onAction: (action: string) => void }) {
  return <div className="ig-result-actions">{actions.map(([Icon, label]) => <button key={label} onClick={() => onAction(label)}><Icon size={15} />{label}</button>)}</div>;
}
