import { CountUp, Skeleton } from "@/components/Stats";
import { type CostLabel, costLabel, type UsageMetric, type UsageStats } from "@/data/usage";
import { formatCost, formatTokens } from "@/util/format";
import { sessionsLabel, UsageProviderRow } from "./UsageProviderRow";

/** What the headline number is, given how much of it the catalog could price.
 *  The label carries the caveat so the figure itself stays a figure. */
const COST_CAPTION: Record<CostLabel["kind"], string> = {
  exact: "total cost",
  partial: "total cost so far — some models unpriced",
  unpriced: "no priced usage",
};

const headlineCost = (stats: UsageStats): CostLabel =>
  costLabel(stats.totalCostUsd, stats.totalTokens, stats.unpricedTokens);

/** Cost counts in cents so the ramp animates on a whole number and still lands
 *  on the exact dollar figure. Partial coverage keeps the ramp but prefixes the
 *  "at least" marker; no coverage at all has no number to ramp. */
function Headline({ stats, metric }: { stats: UsageStats; metric: UsageMetric }) {
  if (metric === "tokens") return <CountUp value={stats.totalTokens} format={formatTokens} />;
  const cost = headlineCost(stats);
  if (cost.kind === "unpriced") return <span className="usg-headline-unpriced">Unpriced</span>;
  return (
    <>
      {cost.kind === "partial" && <span className="usg-approx">≥&nbsp;</span>}
      <CountUp value={Math.round(cost.usd * 100)} format={(c) => formatCost(c / 100)} />
    </>
  );
}

/** The left column: one headline number for the whole window, then the same
 *  number split per provider — and, folded under it, per account for a
 *  provider that ran under more than one. */
export function UsageSummary({
  stats,
  metric,
  loading,
}: {
  stats: UsageStats | null;
  metric: UsageMetric;
  loading: boolean;
}) {
  const cost = stats && metric === "cost" ? headlineCost(stats) : null;
  const caption = metric === "tokens" ? "processed tokens" : COST_CAPTION[cost?.kind ?? "exact"];

  return (
    <div className="usg-summary">
      <div
        className={`usg-headline mono${cost?.tip ? " tip" : ""}`}
        data-tip={cost?.tip ?? undefined}
      >
        {stats ? <Headline stats={stats} metric={metric} /> : <Skeleton height={40} />}
      </div>
      <div className="usg-headline-l text-sm">
        {caption} · {stats ? sessionsLabel(stats.totalSessions) : "—"}
      </div>

      <div className="usg-provs">
        {!stats &&
          loading &&
          // One placeholder per provider the pane can show, so the column
          // doesn't grow under the reader when the scan lands.
          [0, 1].map((i) => <Skeleton key={i} height={46} className="usg-prov-skel" />)}
        {stats?.providers.map((p) => (
          <UsageProviderRow key={p.provider} row={p} />
        ))}
      </div>
    </div>
  );
}
