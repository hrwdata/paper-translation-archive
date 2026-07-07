import { expect, test } from "@playwright/test";

test("source, translation, math, and Lean panes stay synchronized", async ({ page }) => {
  await page.goto("/artifact.html?id=euclid-elements-i47");

  await page.getByTestId("region-p1.r01").click();
  await expect(page.getByTestId("segment-translation.seg01")).toHaveClass(/active/);
  await expect(page.getByTestId("segment-math.seg01")).toHaveClass(/active/);

  await page.getByTestId("lean-span-lean.main.support").click();
  await expect(page.getByTestId("segment-translation.seg04")).toHaveClass(/active/);
  await expect(page.getByTestId("segment-math.seg04")).toHaveClass(/active/);

  await page.getByTestId("lean-span-lean.main.conclusion").click();
  await expect(page.getByTestId("hover-popover")).toContainText("Precomputed only");
});
