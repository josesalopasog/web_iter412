import * as XLSX from "xlsx";

export const downloadXlsx = (filename: string, sheetName: string, headers: string[], rows: string[][]) => {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  worksheet["!cols"] = headers.map((header, colIndex) => {
    const longest = rows.reduce((max, row) => Math.max(max, (row[colIndex] ?? "").length), header.length);
    return { wch: Math.min(Math.max(longest + 2, 10), 40) };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};
