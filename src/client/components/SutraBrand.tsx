/** Shared, accessible Sutra Search OS wordmark for app and authentication. */
export function SutraBrand({
  context = "surface",
  compact = false,
}: {
  context?: "surface" | "sidebar";
  compact?: boolean;
}) {
  const sidebar = context === "sidebar";
  return (
    <span className="inline-flex items-center gap-2.5">
      <img
        src={sidebar ? "/sutra-symbol-aquamarine.svg" : "/sutra-symbol.svg"}
        alt=""
        aria-hidden="true"
        className="size-7 shrink-0"
      />
      <span className="flex flex-col leading-none">
        <span className={sidebar ? "text-lg font-bold tracking-tight text-sidebar-foreground" : "text-lg font-bold tracking-tight text-foreground"}>
          sutra<span className={sidebar ? "text-sidebar-primary" : "text-primary"}>.</span>
        </span>
        {!compact ? (
          <span className={sidebar ? "mt-1 text-[9px] font-semibold tracking-[0.19em] text-sidebar-primary" : "mt-1 text-[9px] font-semibold tracking-[0.19em] text-primary"}>
            SEARCH OS
          </span>
        ) : null}
      </span>
    </span>
  );
}
