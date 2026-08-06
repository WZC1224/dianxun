import type { CalendarEvent, CalendarEventType } from "@/lib/types";

type CryptoTemplate = {
  id: string;
  offsetDays: number;
  hour: number;
  title: string;
  type: Extract<CalendarEventType, "解锁" | "上币" | "会议" | "其他">;
  detail?: string;
};

/** Relative crypto calendar — free unlock APIs unreachable / paid from this env. */
const TEMPLATES: CryptoTemplate[] = [
  {
    id: "unlock-arb-team",
    offsetDays: 2,
    hour: 8,
    title: "ARB 团队份额解锁窗口",
    type: "解锁",
    detail: "参考窗口，以项目方公告为准",
  },
  {
    id: "list-cex-watch",
    offsetDays: 3,
    hour: 10,
    title: "主流所观察区上币窗口",
    type: "上币",
    detail: "具体交易对以官方公告为准",
  },
  {
    id: "unlock-op",
    offsetDays: 5,
    hour: 9,
    title: "OP 生态相关解锁",
    type: "解锁",
    detail: "量级与归属以解锁仪表盘为准",
  },
  {
    id: "meet-industry",
    offsetDays: 8,
    hour: 14,
    title: "行业峰会主题演讲",
    type: "会议",
    detail: "关注监管与机构入场表态",
  },
  {
    id: "list-new-pair",
    offsetDays: 12,
    hour: 11,
    title: "新币现货交易对开放窗口",
    type: "上币",
    detail: "开盘波动大，注意流动性",
  },
  {
    id: "unlock-layer2",
    offsetDays: 18,
    hour: 8,
    title: "L2 治理代币大额解锁",
    type: "解锁",
    detail: "关注抛压预期与做市安排",
  },
  {
    id: "other-governance",
    offsetDays: 22,
    hour: 20,
    title: "主流公链治理提案截止",
    type: "其他",
    detail: "投票结果可能影响短期情绪",
  },
  {
    id: "unlock-sol-eco",
    offsetDays: 27,
    hour: 9,
    title: "SOL 生态项目解锁密集窗口",
    type: "解锁",
    detail: "多项目重叠时波动放大",
  },
];

export function buildCryptoCalendarEvents(
  now = new Date(),
): CalendarEvent[] {
  const base = new Date(now);
  base.setMinutes(0, 0, 0);
  return TEMPLATES.map((t) => {
    const starts = new Date(base);
    starts.setDate(starts.getDate() + t.offsetDays);
    starts.setHours(t.hour, 0, 0, 0);
    return {
      id: `crypto-${t.id}`,
      title: t.title,
      type: t.type,
      startsAt: starts.toISOString(),
      detail: t.detail,
    };
  });
}

export function mergeCalendarEvents(
  ...groups: CalendarEvent[][]
): CalendarEvent[] {
  const map = new Map<string, CalendarEvent>();
  for (const group of groups) {
    for (const e of group) {
      map.set(e.id, e);
    }
  }
  return [...map.values()].sort(
    (a, b) =>
      new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}
