import { test, expect } from "@playwright/test";

test("inicio, catálogo, detalle y regreso conservan navegación real", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Hay lugares",
  );
  await page.getByRole("link", { name: "Explorar desarrollos" }).click();
  await expect(page).toHaveURL(/\/propiedades$/);
  await page.getByRole("link", { name: "Conocer Horizonte" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Horizonte",
  );
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Horizonte",
  );
  await page.getByRole("link", { name: "Consultar precio" }).click();
  await expect(page.locator("#contacto")).toBeInViewport();
  await expect(page.locator("form")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("menú móvil, marca y ausencia de desbordamiento", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.locator(".nav-toggle");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page
    .locator("#crook-nav")
    .getByRole("link", { name: "Desarrollos" })
    .click();
  await expect(page.getByRole("button", { name: "Menú" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator("body")).not.toContainText(/Ga\/Ru|GARU/);
  await page.screenshot({ path: "docs/crook-mobile.png", fullPage: true });
});

test("captura de inicio y ruta inexistente", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "docs/crook-desktop.png", fullPage: true });
  await page.goto("/propiedades/inexistente");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "no está aquí",
  );
});
