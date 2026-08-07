import type { NewsItem, NewsProvider } from "./news-types";

const TITLES = [
  "美联储官员称短期内维持利率不变可能性上升",
  "现货比特币 ETF 单日净流入创近两周新高",
  "以太坊基金会披露下季度扩容路线图重点",
  "某大型矿企宣布增持算力并更新财务指引",
  "稳定币总市值周环比回升，链上活跃地址增加",
  "香港虚拟资产交易平台再添合规持牌机构",
  "SOL 生态借贷协议完成安全审计并开放限额",
  "宏观：美国初请失业金人数低于市场预期",
  "交易所公布季度上币观察名单更新",
  "链上数据显示长期持有者供应占比回升",
  "欧洲监管机构就加密托管征求意见稿",
  "期权市场显示 BTC 近月偏度收敛",
  "某公链主网升级窗口确认，社区提醒节点升级",
  "美元指数走弱，风险资产短线情绪改善",
  "研究：质押收益率波动与资金费率相关性上升",
  "做市商报告称山寨合约持仓集中度下降",
  "跨链桥日活创新高，手续费收入环比增长",
  "机构研报上调 ETH 网络费用中枢预期",
  "东南亚多国推进加密纳税申报试点",
  "开源钱包发布硬件签名兼容更新",
  "期货基差回正，短线多头意愿回暖",
  "NFT 蓝筹地板价分化，头部项目成交回升",
  "去中心化交易所周交易量突破关键阈值",
  "安全团队披露钓鱼攻击新样本并给出排查步骤",
];

const SOURCES = ["律动", "金十", "CoinDesk", "The Block", "PANews", "官方公告"];

export class MockNewsProvider implements NewsProvider {
  async listFlash(params: { limit: number; cursor?: string }) {
    const start = params.cursor ? Number(params.cursor) : 0;
    const limit = Math.min(Math.max(params.limit, 1), 50);
    const now = Date.now();
    const items: NewsItem[] = [];
    for (let i = 0; i < limit; i++) {
      const idx = start + i;
      if (idx >= TITLES.length * 2) break;
      const title = TITLES[idx % TITLES.length];
      const displayTitle =
        idx >= TITLES.length ? `${title}（跟踪）` : title;
      items.push({
        id: `news-${idx}`,
        title: displayTitle,
        summary: `【模拟】${displayTitle}。本条为 mock 摘要，便于应用内详情预览；接入 live 源后将显示真实短讯。`,
        source: SOURCES[idx % SOURCES.length],
        publishedAt: new Date(now - (idx + 1) * 7 * 60_000).toISOString(),
        symbols: idx % 3 === 0 ? ["BTC"] : idx % 3 === 1 ? ["ETH"] : ["SOL"],
      });
    }
    const next = start + items.length;
    const exhausted = next >= TITLES.length * 2;
    return { items, nextCursor: exhausted ? undefined : String(next) };
  }
}
