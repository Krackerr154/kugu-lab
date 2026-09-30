import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { getModule } from "@/lib/modules";

export default function M7BetPage() {
  const module = getModule("m7-bet")!;
  return <ModulePlaceholder module={module} />;
}
