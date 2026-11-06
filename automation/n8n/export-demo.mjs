import ExcelJS from "exceljs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
export const fixtureRows = [
  {
    scenario: "CROOK_FICTITIOUS",
    contract: "CR-2026-001",
    installment: 9,
    due_on: "2026-11-10",
    amount: 500,
    currency: "USD",
  },
  {
    scenario: "CROOK_FICTITIOUS",
    contract: "CR-2026-002",
    installment: 6,
    due_on: "2026-10-20",
    amount: 500,
    currency: "USD",
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
    verify.worksheets[0].getCell("E2").value !== 500
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
