/** Shared, accessible Sutra Search OS wordmark for app and authentication. */
export function SutraBrand({
  context = "surface",
  compact = false,
}: {
  context?: "surface" | "sidebar";
  compact?: boolean;
}) {
  const sidebar = context === "sidebar";
  const labelColor = sidebar ? "text-sidebar-primary" : "text-primary";
  const textColor = sidebar ? "text-sidebar-foreground" : "text-foreground";

  return (
    <span className="inline-flex items-center gap-2.5">
      <img
        src={sidebar ? "/sutra-symbol-aquamarine.svg" : "/sutra-symbol.svg"}
        alt=""
        aria-hidden="true"
        className="size-7 shrink-0"
      />
      <span className="flex flex-col leading-none">
        <span className={`text-lg font-bold tracking-tight ${textColor}`}>
          sutra<span className={labelColor}>.</span>
        </span>
        {!compact ? (
          <span
            className={`mt-1 text-[9px] font-semibold tracking-[0.19em] ${labelColor}`}
          >
            SEARCH OS
          </span>
        ) : null}
      </span>
    </span>
  );
}
