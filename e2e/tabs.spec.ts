import { expect, test } from "@playwright/test";

const TABS = [
  { name: "快讯", path: "/" },
  { name: "点位", path: "/levels" },
  { name: "多空", path: "/long-short" },
  { name: "日历", path: "/calendar" },
] as const;

test("四 Tab 页面可打开", async ({ page }) => {
  for (const tab of TABS) {
    await page.goto(tab.path);
    const nav = page.getByRole("navigation", { name: "主导航" });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: tab.name })).toBeVisible();
  }
});

test("底栏点击可切换 Tab", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "主导航" });
  await expect(nav).toBeVisible();

  await nav.getByRole("link", { name: "点位" }).click({ force: true });
  await expect(page).toHaveURL(/\/levels/);

  await nav.getByRole("link", { name: "多空" }).click({ force: true });
  await expect(page).toHaveURL(/\/long-short/);

  await nav.getByRole("link", { name: "日历" }).click({ force: true });
  await expect(page).toHaveURL(/\/calendar/);

  await nav.getByRole("link", { name: "快讯" }).click({ force: true });
  await expect(page).toHaveURL(/\/$/);
});

test("manifest 可访问", async ({ request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.short_name).toBe("点讯");
  expect(body.display).toBe("standalone");
  expect(Array.isArray(body.icons)).toBeTruthy();
  expect(body.icons.length).toBeGreaterThan(0);
});
