import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { getModule } from "@/lib/modules";

export default function M3SnO2Page() {
  const module = getModule("m3-sno2-precipitation")!;
  return <ModulePlaceholder module={module} />;
}
