import type { CalendarEvent } from "@/lib/types";

export async function mockCalendar(days: 7 | 30): Promise<CalendarEvent[]> {
  const base = new Date();
  base.setMinutes(0, 0, 0);
  const events: CalendarEvent[] = [
    {
      id: "c1",
      title: "美国核心 PCE 同比公布",
      type: "宏观",
      startsAt: addHours(base, 14),
      detail: "前值 2.8% 预期 2.6%",
    },
    {
      id: "c2",
      title: "ARB 解锁",
      type: "解锁",
      startsAt: addHours(base, 22),
      detail: "解锁数量约团队与生态份额",
    },
    {
      id: "c3",
      title: "币安观察区项目上线窗口",
      type: "上币",
      startsAt: addDays(base, 1, 10),
      detail: "具体交易对以公告为准",
    },
    {
      id: "c4",
      title: "美联储官员讲话",
      type: "会议",
      startsAt: addDays(base, 2, 9),
      detail: "关注利率路径表态",
    },
    {
      id: "c5",
      title: "ETH 质押相关治理投票截止",
      type: "其他",
      startsAt: addDays(base, 3, 18),
    },
    {
      id: "c6",
      title: "非农就业数据",
      type: "宏观",
      startsAt: addDays(base, 5, 20),
      detail: "预期与前值对比关注薪资",
    },
    {
      id: "c7",
      title: "大型解锁：OP",
      type: "解锁",
      startsAt: addDays(base, 12, 8),
    },
    {
      id: "c8",
      title: "行业峰会主题演讲",
      type: "会议",
      startsAt: addDays(base, 20, 15),
    },
  ];

  const horizon = Date.now() + days * 24 * 3600_000;
  return events.filter((e) => new Date(e.startsAt).getTime() <= horizon);
}

function addHours(d: Date, h: number): string {
  return new Date(d.getTime() + h * 3600_000).toISOString();
}

function addDays(d: Date, days: number, hour: number): string {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  n.setHours(hour, 0, 0, 0);
  return n.toISOString();
}
