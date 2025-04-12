/**
 * Format a date to a localized string
 */
export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Converts an array of objects to downloadable Excel file
 */
export function exportToExcel(data: any[], fileName: string) {
  if (typeof window !== 'undefined') {
    import('xlsx').then(XLSX => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Veri");
      
      // Sütun genişliklerini ayarlama
      const maxWidth = 20;
      worksheet['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: maxWidth }));
      
      // Excel dosyasını indirme
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    });
  }
}

/**
 * Parses an Excel file and returns the data as JSON
 */
export async function parseExcelFile(file: File): Promise<any[]> {
  const XLSX = await import('xlsx');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
} 