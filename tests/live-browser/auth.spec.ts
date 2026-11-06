import { test, expect } from "@playwright/test";
const password = process.env.CROOK_DEMO_PASSWORD;
test("real buyer session survives reload and denies administrative routes", async ({
  page,
}) => {
  if (!password)
    throw new Error("Private isolated test configuration required");
  await page.goto("/acceso");
  await page.getByLabel("Correo electrónico").fill("lucia@example.com");
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  await expect(page).toHaveURL(/\/cliente$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Lucía");
  await page.getByRole("combobox",{name:"Contrato",exact:true}).selectOption("1");
  await expect(
    page.locator(".metric").filter({ hasText: "Cuotas registradas" }),
  ).toContainText("8 / 48");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Lucía");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Acceso no habilitado",
  );
});
test("real administrator sees persisted clients and contract installment data", async ({
  page,
}) => {
  if (!password)
    throw new Error("Private isolated test configuration required");
  await page.goto("/acceso");
  await page.getByLabel("Correo electrónico").fill("admin@crook.example");
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("link", { name: "Clientes", exact: true }).click();
  await expect(page.locator("tbody")).toContainText("Lucía Fernández");
  await page.getByRole("link", { name: "Contratos y planes" }).click();
  await page.getByRole("button", { name: "Ver condiciones" }).first().click();
  await expect(page.getByRole("dialog").locator("tbody tr")).toHaveCount(48);
});
