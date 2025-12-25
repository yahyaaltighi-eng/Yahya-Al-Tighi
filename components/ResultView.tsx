import React, { useMemo, useState } from 'react';
import { Employee, MonthlyRecord, YearSummary } from '../types';
import { Printer, ChevronDown, ChevronUp, FileText, Calculator, Calendar } from 'lucide-react';

interface ResultViewProps {
  employee: Employee;
  onNewSearch: () => void;
}

// Utility to format currency
const formatMoney = (amount: number) => {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' د.ل';
};

const ResultView: React.FC<ResultViewProps> = ({ employee, onNewSearch }) => {
  
  // Process Data: Group by Year
  const yearGroups = useMemo(() => {
    const groups: Record<number, YearSummary> = {};
    
    employee.records.forEach(record => {
      if (!groups[record.year]) {
        groups[record.year] = {
          year: record.year,
          records: [],
          totalOld: 0,
          totalNew: 0,
          totalDiff: 0
        };
      }
      groups[record.year].records.push(record);
      groups[record.year].totalOld += record.oldSalary;
      groups[record.year].totalNew += record.newSalary;
      groups[record.year].totalDiff += record.difference;
    });

    return Object.values(groups).sort((a, b) => a.year - b.year);
  }, [employee]);

  const grandTotalDiff = useMemo(() => {
    return employee.records.reduce((sum, r) => sum + r.difference, 0);
  }, [employee]);

  // State to toggle years
  const [openYears, setOpenYears] = useState<Record<number, boolean>>({
    2018: true, 2019: true, 2020: true, 2021: true
  });

  const toggleYear = (year: number) => {
    setOpenYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn pb-12 font-sans">
      {/* Employee Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-primary-100 dark:border-gray-700 p-6 mb-6 print:shadow-none print:border-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div>
             <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-400 flex items-center gap-2">
               <FileText className="text-primary-500" />
               بيانات الموظف المالية
             </h2>
             <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">كشف الفروقات عن الفترة من 10/2018 إلى 9/2021</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2 print:hidden">
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2 text-sm font-medium"
            >
              <Printer size={16} />
              طباعة
            </button>
            <button 
              onClick={onNewSearch}
              className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition text-sm font-medium"
            >
              بحث جديد
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm md:text-base">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="block text-gray-500 dark:text-gray-400 text-xs mb-1">الاسم الرباعي</span>
            <span className="font-bold text-gray-800 dark:text-gray-100">{employee.fullName}</span>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
             <span className="block text-gray-500 dark:text-gray-400 text-xs mb-1">الرقم الوطني</span>
             <span className="font-bold text-gray-800 dark:text-gray-100">{employee.nationalId}</span>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
             <span className="block text-gray-500 dark:text-gray-400 text-xs mb-1">الرقم المالي</span>
             <span className="font-bold text-gray-800 dark:text-gray-100">{employee.financialId}</span>
          </div>
           <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
             <span className="block text-gray-500 dark:text-gray-400 text-xs mb-1">المكتب / القسم</span>
             <span className="font-bold text-gray-800 dark:text-gray-100">{employee.department}</span>
          </div>
        </div>
      </div>

      {/* Yearly Tables */}
      <div className="space-y-6">
        {yearGroups.map((group) => (
          <div key={group.year} className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden print:break-inside-avoid">
            <button 
              onClick={() => toggleYear(group.year)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`p-1.5 rounded-full ${openYears[group.year] ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-500'}`}>
                  {openYears[group.year] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">سنة {group.year}</h3>
                <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-gray-600 dark:text-gray-300">
                  {group.records.length} أشهر
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 dark:text-gray-400 block">إجمالي الفروقات للسنة</span>
                <span className="font-bold text-green-600 dark:text-green-400">{formatMoney(group.totalDiff)}</span>
              </div>
            </button>

            {openYears[group.year] && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 border-b dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">الشهر</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">الدرجة</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">العلاوة</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">الوضع</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">المرتب القديم</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">المرتب بعد الزيادة</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap bg-primary-100 dark:bg-primary-900/40">الفرق</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {group.records.map((record, idx) => (
                      <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {record.monthName} ({record.month})
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{record.grade}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{record.bonus}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{record.salaryStatus}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatMoney(record.oldSalary)}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatMoney(record.newSalary)}</td>
                        <td className="px-4 py-3 text-green-600 dark:text-green-400 font-bold bg-green-50/50 dark:bg-green-900/10 whitespace-nowrap">
                          {formatMoney(record.difference)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-bold text-gray-800 dark:text-gray-100 border-t dark:border-gray-600">
                     <tr>
                       <td colSpan={4} className="px-4 py-3 text-center">الإجمالي السنوي</td>
                       <td className="px-4 py-3">{formatMoney(group.totalOld)}</td>
                       <td className="px-4 py-3">{formatMoney(group.totalNew)}</td>
                       <td className="px-4 py-3 text-green-700 dark:text-green-400 bg-green-100/30 dark:bg-green-900/20">{formatMoney(group.totalDiff)}</td>
                     </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Grand Total & Month Count */}
      <div className="mt-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 print:bg-none print:text-black print:border-2 print:border-black">
        
        {/* Money Total */}
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full print:hidden">
            <Calculator size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">الإجمالي الكلي المستحق</h3>
            <p className="text-primary-100 text-sm print:text-gray-600">مجموع الفروقات المالية</p>
            <div className="text-3xl md:text-4xl font-bold mt-1">
              {formatMoney(grandTotalDiff)}
            </div>
          </div>
        </div>

        {/* Month Count */}
        <div className="flex items-center gap-4 md:justify-end border-t md:border-t-0 md:border-r border-white/20 pt-4 md:pt-0 md:pr-6">
          <div className="bg-white/20 p-3 rounded-full print:hidden">
            <Calendar size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">عدد الأشهر المحسوبة</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold">{employee.records.length}</span>
              <span className="text-lg opacity-80">من أصل</span>
              <span className="text-3xl font-bold">36</span>
              <span className="text-lg opacity-80">شهر</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section - Red Attention */}
      <div className="mt-6 border-r-4 border-red-600 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow-sm">
        <h3 className="text-red-700 dark:text-red-400 font-bold text-lg mb-2 flex items-center gap-2">
          ملاحظات هامة:
        </h3>
        <p className="text-red-600 dark:text-red-300 font-medium leading-relaxed text-lg">
          {employee.notes || 'لا توجد ملاحظات مسجلة حالياً.'}
        </p>
      </div>

    </div>
  );
};

export default ResultView;