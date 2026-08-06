import { getDataMode } from "@/lib/providers/data-mode";

export type DataSource = "live" | "mock";

export type DataSourceMeta = {
  dataSource: DataSource;
  /** true when DATA_MODE=live but response fell back to mock */
  degraded: boolean;
};

export function dataSourceMeta(source: DataSource): DataSourceMeta {
  return {
    dataSource: source,
    degraded: getDataMode() === "live" && source === "mock",
  };
}
