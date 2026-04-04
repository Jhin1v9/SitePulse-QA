import { SitePulseScreen } from "@/components/sitepulse/SitePulseScreen";
import { buildSitePulseMockState } from "@/data/sitepulse-mock";

export default function Page() {
  return <SitePulseScreen initialState={buildSitePulseMockState()} />;
}
