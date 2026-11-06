import ExcelJS from "exceljs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
export const fixtureRows = [
  {
    usuario: "lucia@example.com",
    cuota_pagada: 1,
    fecha: "2026-03-10",
    monto_pagado: 687500,
  },
  {
    usuario: "lucia@example.com",
    cuota_pagada: 2,
    fecha: "2026-04-10",
    monto_pagado: 687500,
  },
];
export async function generateDemoXlsx(path) {
  const book = new ExcelJS.Workbook();
  const sheet = book.addWorksheet("Datos ficticios");
  sheet.columns = Object.keys(fixtureRows[0]).map((key) => ({
    header: key,
    key,
    width: 23,
  }));
  sheet.addRows(fixtureRows);
  await book.xlsx.writeFile(path);
  const verify = new ExcelJS.Workbook();
  await verify.xlsx.readFile(path);
  if (
    verify.worksheets[0].rowCount !== 3 ||
    verify.worksheets[0].getCell("D2").value !== 687500
  )
    throw new Error("XLSX verification failed");
  return {
    status: "verified-local-file",
    rows: fixtureRows.length,
    bytes: (await readFile(path)).length,
  };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await mkdir("artifacts", { recursive: true });
  const result = await generateDemoXlsx("artifacts/crook-fictitious.xlsx");
  await writeFile(
    "artifacts/xlsx-verification.json",
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result));
}
