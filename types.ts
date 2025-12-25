export interface MonthlyRecord {
  id: string;
  year: number;
  month: number;
  monthName: string;
  grade: string; // الدرجة
  bonus: number; // العلاوة
  salaryStatus: string; // وضع المرتب
  oldSalary: number; // المرتب القديم
  newSalary: number; // المرتب بعد الزيادة
  difference: number; // الفرق
}

export interface YearSummary {
  year: number;
  records: MonthlyRecord[];
  totalOld: number;
  totalNew: number;
  totalDiff: number;
}

export interface Employee {
  nationalId: string; // الرقم الوطني (Key)
  financialId: string; // الرقم المالي
  fullName: string;
  department: string; // القسم/المكتب
  records: MonthlyRecord[];
  notes?: string;
  startMonth: number; // 10
  startYear: number; // 2018
  endMonth: number; // 9
  endYear: number; // 2021
}

export interface AdminUser {
  username: string;
  role: 'super_admin' | 'admin';
}
