import { test, expect } from "@playwright/test";
test("unconfigured connected mode never exposes mock contracts or demo entry", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "No pudimos obtener los datos",
  );
  await expect(page.getByRole("alert")).toContainText(
    "Falta configurar Supabase",
  );
  await expect(page.locator(".project-card")).toHaveCount(0);
  await page.goto("/admin/pagos");
  await expect(page).toHaveURL(/\/acceso$/);
  await expect(page.getByLabel("Correo electrónico")).toBeVisible();
  await expect(page.getByRole("link", { name: "Soy comprador" })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("button", { name: "Registrar pago" }),
  ).toHaveCount(0);
});
