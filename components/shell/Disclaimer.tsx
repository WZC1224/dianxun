export function Disclaimer({ full = false }: { full?: boolean }) {
  return (
    <p className="text-center text-xs text-mute">
      {full
        ? "点位由规则算法生成，仅供参考，不构成投资建议。交易有风险，决策自负。"
        : "仅供参考 · 非投资建议"}
    </p>
  );
}
