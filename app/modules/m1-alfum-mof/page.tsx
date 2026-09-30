import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { getModule } from "@/lib/modules";

export default function M1AlFumPage() {
  const module = getModule("m1-alfum-mof")!;
  return <ModulePlaceholder module={module} />;
}
