import { useState } from "react";
import { DEFAULT_ACCOUNT_ID } from "@/api/types/providers";
import { Icon } from "@/components/Icon";
import { ProviderIcon } from "@/components/ProviderIcon";
import { accountLabel } from "@/data/providerAccounts";
import { providerChip, providerLabel } from "@/data/providers";
import { coverageLabel, type UsageProviderRow as Row, type UsageAccountRow } from "@/data/usage";
import { formatPercent, formatTokens } from "@/util/format";

export const sessionsLabel = (n: number) =>
  `${n.toLocaleString()} ${n === 1 ? "session" : "sessions"}`;

/** The right-hand figures of a row: tokens over share and cost. */
function Figures({ row, size }: { row: Row | UsageAccountRow; size: "text-base" | "text-sm" }) {
  const cost = coverageLabel(row);
  return (
    <span className="usg-prov-nums">
      <span className={`usg-prov-tok mono ${size}`}>{formatTokens(row.tokens)}</span>
      <span
        className={`usg-prov-sub text-xs${cost.tip ? " tip" : ""}`}
        data-tip={cost.tip ?? undefined}
      >
        {formatPercent(row.share)} of tokens ·{" "}
        <span className={cost.kind === "unpriced" ? "usg-unpriced" : undefined}>{cost.text}</span>
      </span>
    </span>
  );
}

/** One account's part of a provider row, indented under it. */
function AccountSplit({ row }: { row: UsageAccountRow }) {
  const label = accountLabel({ id: row.account, managed: row.account !== DEFAULT_ACCOUNT_ID });
  return (
    <div className="usg-prov usg-prov-acct flex-center">
      <span className="usg-prov-id">
        <span className="usg-prov-acct-name text-sm">{label}</span>
        <span className="usg-prov-sub text-xs">{sessionsLabel(row.sessions)}</span>
      </span>
      <Figures row={row} size="text-sm" />
    </div>
  );
}

/** A provider's share of the window. One that ran under more than one account
 *  folds its per-account split away behind the row, closed by default. */
export function UsageProviderRow({ row }: { row: Row }) {
  const [open, setOpen] = useState(false);
  const split = row.accounts.length > 1;

  const body = (
    <>
      <ProviderIcon slug={row.provider} {...providerChip(row.provider)} size={26} />
      <span className="usg-prov-id">
        <span className="usg-prov-name flex-center text-base">
          <span className="truncate">{providerLabel(row.provider)}</span>
          {split && <Icon name="chevR" size={10} className="usg-prov-chev" />}
        </span>
        <span className="usg-prov-sub text-xs">{sessionsLabel(row.sessions)}</span>
      </span>
      <Figures row={row} size="text-base" />
    </>
  );

  if (!split) return <div className="usg-prov flex-center">{body}</div>;
  return (
    <>
      <button
        type="button"
        className="usg-prov usg-prov-toggle flex-center"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {body}
      </button>
      {open && row.accounts.map((a) => <AccountSplit key={a.account} row={a} />)}
    </>
  );
}
