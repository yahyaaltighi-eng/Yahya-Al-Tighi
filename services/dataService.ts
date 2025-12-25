import { Employee, MonthlyRecord } from '../types';

// Helper to generate template records (fallback)
const generateRecords = (baseOld: number, baseNew: number): MonthlyRecord[] => {
  const records: MonthlyRecord[] = [];
  const startDate = new Date(2018, 9, 1);
  const endDate = new Date(2021, 8, 30);
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const monthName = new Intl.DateTimeFormat('ar-LY', { month: 'long' }).format(currentDate);
    records.push({
      id: `${year}-${month}`,
      year,
      month,
      monthName,
      grade: 'الدرجة 9',
      bonus: 150,
      salaryStatus: 'إفراج',
      oldSalary: baseOld,
      newSalary: baseNew,
      difference: baseNew - baseOld
    });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  return records;
};

class DataService {
  private dbName = 'SuluqHR_DB';
  private dbVersion = 1;
  private storeName = 'employees';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error("IndexedDB error");
        reject();
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'nationalId' });
        }
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    await this.initDB();
    return this.db!;
  }

  async getEmployee(nid: string): Promise<Employee | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(nid);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllEmployees(): Promise<Employee[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveEmployee(emp: Employee): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(emp);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteEmployee(nid: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(nid);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllData(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCount(): Promise<number> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const countRequest = store.count();
      countRequest.onsuccess = () => resolve(countRequest.result);
      countRequest.onerror = () => resolve(0);
    });
  }

  createTemplateEmployee(nid: string, name: string, finId: string): Employee {
    return {
      nationalId: nid,
      fullName: name,
      financialId: finId,
      department: 'عام',
      startMonth: 10,
      startYear: 2018,
      endMonth: 9,
      endYear: 2021,
      records: generateRecords(800, 1500),
      notes: ''
    };
  }

  private normalizeHeader(header: string): string {
    if (!header) return '';
    return String(header)
      .trim()
      .toLowerCase()
      .replace(/[_\-\s\.]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ي$/g, 'ي')
      .replace(/ى$/g, 'ي');
  }

  // Parse strings like "1018" -> {month: 10, year: 2018}
  private parseSuffixToDate(suffix: string): { month: number, year: number } | null {
    if (!suffix) return null;
    
    // Pattern MMYY (e.g. 1018, 921)
    const match = suffix.match(/^(\d{1,2})(18|19|20|21)$/);
    if (match) {
        const m = parseInt(match[1]);
        const y = 2000 + parseInt(match[2]);
        if (m >= 1 && m <= 12) return { month: m, year: y };
    }
    return null;
  }

  parseExcelData(rows: any[]): Record<string, Employee> {
    if (!rows || rows.length === 0) return {};

    // ---------------------------------------------------------
    // PERFORMANCE OPTIMIZATION: PRE-CALCULATE COLUMN MAPPINGS
    // ---------------------------------------------------------
    
    // 1. Get all available headers from the first valid row (assuming consistent structure)
    // We scan a few rows to be safe, but usually header keys are consistent
    const allHeadersSet = new Set<string>();
    const sampleSize = Math.min(rows.length, 5); 
    for(let i=0; i<sampleSize; i++) {
        Object.keys(rows[i]).forEach(k => allHeadersSet.add(k));
    }
    const allHeaders = Array.from(allHeadersSet);

    // 2. Map Main Columns (National ID, Name, etc)
    const findKey = (keywords: string[]) => {
      for (const key of allHeaders) {
          const norm = this.normalizeHeader(key);
          if (keywords.some(k => norm === this.normalizeHeader(k)) || 
              keywords.some(k => norm.includes(this.normalizeHeader(k)) && !/\d/.test(key))) {
              return key;
          }
      }
      return null;
    };

    const keyNid = findKey(['الرقم الوطني', 'رقم وطني', 'nid', 'national_id']);
    const keyFinId = findKey(['الرقم المالي', 'رقم مالي', 'رقم الملف', 'fin_id']);
    const keyName = findKey(['الاسم', 'اسم الموظف', 'full_name']);
    const keyDept = findKey(['القسم', 'المكتب', 'الادارة', 'department']);
    const keyNotes = findKey(['ملاحظات', 'الملاحظات', 'notes']);

    if (!keyNid) throw new Error("لم يتم العثور على عمود الرقم الوطني");

    // 3. Map Suffix Columns (Grade 1018, Salary 1018, etc.)
    // Detect all suffixes first
    const foundSuffixes = new Set<string>();
    const suffixToDateMap: Record<string, {month: number, year: number}> = {};

    allHeaders.forEach(h => {
        const numbers = h.match(/(\d{3,4})$/);
        if (numbers) {
            const potentialSuffix = numbers[1];
            const date = this.parseSuffixToDate(potentialSuffix);
            if (date) {
                foundSuffixes.add(potentialSuffix);
                suffixToDateMap[potentialSuffix] = date;
            }
        }
    });

    const sortedSuffixes = Array.from(foundSuffixes).sort((a, b) => {
        const da = suffixToDateMap[a];
        const db = suffixToDateMap[b];
        if (da.year !== db.year) return da.year - db.year;
        return da.month - db.month;
    });

    // Create a robust map: Suffix -> { gradeKey, bonusKey, statusKey, oldSalKey, newSalKey, diffKey }
    // This prevents searching Object.keys() for every row * every suffix * every field (O(N^3))
    const columnMap: Record<string, any> = {};

    const findSuffixKey = (keyword: string, suffix: string) => {
        const normalizedKeyword = this.normalizeHeader(keyword);
        for (const key of allHeaders) {
            const normalizedKey = this.normalizeHeader(key);
            if (normalizedKey.includes(normalizedKeyword) && normalizedKey.includes(suffix)) {
                return key;
            }
        }
        return null;
    };

    sortedSuffixes.forEach(suffix => {
        // Precise logic for New Salary (n1018)
        let newSalKey = allHeaders.find(k => this.normalizeHeader(k) === 'n' + suffix);
        if (!newSalKey) {
            newSalKey = findSuffixKey('المرتب بعد', suffix) || findSuffixKey('new', suffix);
        }

        // Precise logic for Diff
        let diffKey = findSuffixKey('الفرق', suffix) || findSuffixKey('فروقات', suffix) || findSuffixKey('difference', suffix);
        // Fallback: if a column is named EXACTLY "1018", it's likely the difference/amount
        if (!diffKey) {
            const exactNumKey = allHeaders.find(k => k.trim() === suffix);
            if (exactNumKey) diffKey = exactNumKey;
        }

        columnMap[suffix] = {
            grade: findSuffixKey('الدرجة', suffix) || findSuffixKey('grade', suffix),
            bonus: findSuffixKey('العلاوة', suffix) || findSuffixKey('bonus', suffix),
            status: findSuffixKey('وضع', suffix) || findSuffixKey('حالة', suffix),
            oldSal: findSuffixKey('المرتب القديم', suffix) || findSuffixKey('old', suffix),
            newSal: newSalKey,
            diff: diffKey
        };
    });

    // ---------------------------------------------------------
    // ITERATION PHASE (Now O(Rows * Suffixes), much faster)
    // ---------------------------------------------------------
    
    const employeesMap: Record<string, Employee> = {};

    for (const row of rows) {
        const nidRaw = row[keyNid];
        if (!nidRaw) continue;
        const nid = String(nidRaw).trim();
        if (nid.length < 5) continue;

        const emp: Employee = {
            nationalId: nid,
            financialId: keyFinId ? String(row[keyFinId] || '') : '',
            fullName: keyName ? String(row[keyName] || 'موظف') : 'موظف',
            department: keyDept ? String(row[keyDept] || 'عام') : 'عام',
            notes: keyNotes ? String(row[keyNotes] || '') : '',
            startMonth: 10,
            startYear: 2018,
            endMonth: 9,
            endYear: 2021,
            records: []
        };

        for (const suffix of sortedSuffixes) {
            const keys = columnMap[suffix];
            const dateInfo = suffixToDateMap[suffix];

            // Direct access using pre-calculated keys (No Loop here!)
            const grade = keys.grade ? (row[keys.grade] || 'الدرجة 9') : 'الدرجة 9';
            const bonus = keys.bonus ? parseFloat(row[keys.bonus] || 0) : 0;
            const status = keys.status ? (row[keys.status] || 'إفراج') : 'إفراج';
            const oldSal = keys.oldSal ? parseFloat(row[keys.oldSal] || 0) : 0;
            const newSal = keys.newSal ? parseFloat(row[keys.newSal] || 0) : 0;
            let diff = keys.diff ? parseFloat(row[keys.diff] || 0) : 0;

            // Logic: if diff is 0, calculate it
            if (diff === 0) {
                if (newSal !== 0) {
                    diff = newSal - oldSal; // if oldSal is 0, diff = newSal
                }
            }

            if (diff !== 0 || newSal !== 0 || oldSal !== 0) {
                const date = new Date(dateInfo.year, dateInfo.month - 1, 1);
                const monthName = new Intl.DateTimeFormat('ar-LY', { month: 'long' }).format(date);

                emp.records.push({
                    id: `${nid}-${suffix}`,
                    year: dateInfo.year,
                    month: dateInfo.month,
                    monthName: monthName,
                    grade: String(grade),
                    bonus: bonus,
                    salaryStatus: String(status),
                    oldSalary: oldSal,
                    newSalary: newSal,
                    difference: diff
                });
            }
        }

        employeesMap[nid] = emp;
    }

    return employeesMap;
  }

  // Bulk save to IndexedDB (Optimized)
  async saveBulkEmployees(employees: Employee[]) {
    const db = await this.getDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      // Perform puts without waiting for individual success to speed up transaction
      for (const emp of employees) {
          store.put(emp);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const dataService = new DataService();