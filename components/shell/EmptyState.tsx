type Props = {
  title: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "mute" | "short";
};

export function EmptyState({
  title,
  detail,
  actionLabel,
  onAction,
  tone = "mute",
}: Props) {
  return (
    <div
      className="flex flex-col items-center gap-2 py-10 text-center"
      role={tone === "short" ? "alert" : "status"}
    >
      <p
        className={`text-sm ${tone === "short" ? "text-short" : "text-mute"}`}
      >
        {title}
      </p>
      {detail ? (
        <p className="max-w-[16rem] text-[11px] leading-snug text-mute">
          {detail}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          className="mt-1 rounded-[length:var(--radius)] px-3 py-1.5 text-xs text-live transition-colors hover:bg-slip"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
