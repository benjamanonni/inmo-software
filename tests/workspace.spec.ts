import { test, expect } from "@playwright/test";

test("registrar y anular un pago actualiza el comprador y conserva historial", async ({
  page,
}) => {
  await page.goto("/admin/pagos");
  await page.getByRole("button", { name: "+ Registrar pago" }).click();
  await page.getByRole("button", { name: "Confirmar registro demo" }).click();
  await expect(page.getByRole("status")).toContainText("Pago demo registrado");
  await page.getByRole("link", { name: "Cambiar vista demo" }).click();
  await expect(
    page.locator(".metric").filter({ hasText: "Cuotas registradas" }),
  ).toContainText("9 / 48");
  await expect(
    page.locator(".metric").filter({ hasText: "Aportes registrados" }),
  ).toContainText("6.187.500");
  await page.getByRole("link", { name: "Cambiar vista demo" }).click();
  await page
    .getByRole("navigation", { name: "Administración", exact: true })
    .getByRole("link", { name: "Pagos", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Anular", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Motivo de la anulación")
    .fill("Registro duplicado de demostración");
  await page.getByRole("button", { name: "Confirmar anulación demo" }).click();
  await expect(page.locator("tbody tr").first()).toContainText("Anulado");
  await page.getByRole("button", { name: "Ver historial" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Registro duplicado de demostración",
  );
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await page.getByRole("link", { name: "Cambiar vista demo" }).click();
  await expect(
    page.locator(".metric").filter({ hasText: "Cuotas registradas" }),
  ).toContainText("8 / 48");
});

test("publicar, habilitar cuenta y alta de cliente tienen comportamiento visible", async ({
  page,
}) => {
  await page.goto("/admin/propiedades");
  await page
    .getByRole("button", { name: "Despublicar", exact: true })
    .first()
    .click();
  await page.getByRole("link", { name: "Ver sitio público" }).click();
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page.getByRole("link", { name: "Mi espacio" }).click();
  await page
    .getByRole("link", { name: "Administración", exact: false })
    .click();
  await page.getByRole("link", { name: "Cuentas de acceso" }).click();
  await page
    .getByRole("button", { name: "Deshabilitar acceso" })
    .first()
    .click();
  await page.getByRole("button", { name: "Confirmar cambio" }).click();
  await page.getByRole("link", { name: "Cambiar vista demo" }).click();
  await expect(page.locator(".empty-state")).toContainText(
    "Cuenta demo deshabilitada",
  );
  await page.getByRole("link", { name: "Cambiar vista demo" }).click();
  await page.getByRole("link", { name: "Clientes", exact: true }).click();
  await page.getByRole("button", { name: "Nuevo cliente" }).click();
  await page.getByLabel("Nombre y apellido").fill("Cliente de prueba");
  await page.getByLabel("Correo electrónico").fill("prueba@example.com");
  await page.getByRole("button", { name: "Crear cliente" }).click();
  await page
    .getByPlaceholder("Nombre o correo electrónico")
    .fill("prueba@example.com");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody tr")).toContainText("Sin habilitar");
});

test("todas las vistas desktop y móvil sin errores ni desbordamiento", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const routes = [
    "/acceso",
    "/admin",
    "/admin/clientes",
    "/admin/contratos",
    "/admin/lotes",
    "/admin/pagos",
    "/admin/propiedades",
    "/admin/reportes",
    "/admin/cuentas",
    "/cliente",
    "/cliente/lote",
    "/cliente/cuotas",
    "/cliente/pagos",
    "/cliente/perfil",
  ];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} @${width}`,
      ).toBe(true);
      if (["/admin", "/cliente", "/acceso"].includes(route)) {
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({
          path: `docs/crook-${route.slice(1)}-${width}.png`,
          fullPage: true,
        });
      }
    }
  }
  expect(errors).toEqual([]);
});

test("cuotas, comprobante y navegación móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/cliente");
  await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("link", { name: "Mis cuotas", exact: true }).click();
  await page.getByRole("button", { name: "Registradas", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(8);
  await page.getByRole("link", { name: "Ver pago" }).first().click();
  await page.getByRole("button", { name: "Ver comprobante" }).first().click();
  await expect(page.getByRole("dialog")).toContainText("SIN VALIDEZ COMERCIAL");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
