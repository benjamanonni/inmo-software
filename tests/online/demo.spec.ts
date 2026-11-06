import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
const privateAccess = readFileSync("artifacts/ACCESOS-ONLINE.txt", "utf8");
function credentials(email: string) {
  const entry = privateAccess
    .split("\n\n")
    .find((block) => block.includes(`| ${email} |`));
  const password = entry?.match(/Contraseña: (.+)/)?.[1].trim();
  if (!password)
    throw new Error("Private online test credentials are missing.");
  return { email, password };
}
async function login(page: Page, email: string) {
  const account = credentials(email);
  await page.goto("/acceso");
  await page
    .getByLabel("Correo electrónico", { exact: true })
    .fill(account.email);
  await page.getByLabel("Contraseña", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
}
test("public Preview serves direct routes, catalog, photos and mobile navigation", async ({
  page,
  request,
}) => {
  for (const route of [
    "/",
    "/propiedades",
    "/propiedades/horizonte",
    "/acceso",
    "/cliente/cuotas",
  ]) {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    expect(response.headers()["x-robots-tag"]).toContain("noindex");
  }
  await page.goto("/propiedades");
  await expect(
    page.getByText("Horizonte", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Los Olivos", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.locator("main")).not.toContainText(
    /ARS|USD|\$30|33\.000\.000/,
  );
  await page.goto("/propiedades/horizonte");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Horizonte",
  );
  await expect
    .poll(() =>
      page
        .locator("main img")
        .evaluateAll(
          (images) =>
            images.filter(
              (image) =>
                (image as HTMLImageElement).complete &&
                (image as HTMLImageElement).naturalWidth > 0,
            ).length,
        ),
    )
    .toBeGreaterThan(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: /menú/i })).toBeVisible();
  await page.getByRole("button", { name: /menú/i }).click();
  await expect(
    page.getByRole("link", { name: "Desarrollos", exact: true }).first(),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("online buyer persists across reload and cannot enter administration", async ({
  page,
}) => {
  await login(page, "lucia@crook.example");
  await expect(page).toHaveURL(/\/cliente$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Lucía");
  await expect(page.locator("main")).toContainText("8 / 48");
  await page.reload();
  await expect(page.locator("main")).toContainText("8 / 48");
  for (const route of ["lote", "cuotas", "pagos", "perfil"]) {
    await page.goto(`/cliente/${route}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("main")).not.toContainText(
      "No se pudieron cargar",
    );
  }
  await page.screenshot({
    path: "artifacts/online-comprador.png",
    fullPage: true,
  });
  await page.goto("/admin");
  await expect(page.getByRole("alert")).toContainText(/permiso|acceso/i);
});
test("online administrator traverses every persisted view and logs out", async ({
  page,
}) => {
  await login(page, "admin@crook.example");
  await expect(page).toHaveURL(/\/admin$/);
  for (const route of [
    "",
    "clientes",
    "contratos",
    "lotes",
    "pagos",
    "propiedades",
    "reportes",
    "cuentas",
  ]) {
    await page.goto(`/admin${route ? `/${route}` : ""}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("main")).not.toContainText(
      "No se pudieron cargar",
    );
  }
  await page.goto("/admin");
  await expect(page.locator("main")).toContainText("5.500.000");
  await page.screenshot({
    path: "artifacts/online-administrador.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /cerrar sesión/i }).click();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/acceso/);
});
test("disabled fictitious buyer cannot enter private views", async ({
  page,
}) => {
  await login(page, "carolina@crook.example");
  await expect(page.getByRole("alert")).toContainText(
    /deshabilitad|habilitad|permiso/i,
  );
  await page.goto("/cliente");
  await expect(page).not.toHaveURL(/\/cliente$/);
});
