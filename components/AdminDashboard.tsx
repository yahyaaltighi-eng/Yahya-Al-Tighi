import React, { useState, useEffect, useRef } from 'react';
import { dataService } from '../services/dataService';
import { Employee } from '../types';
import { Plus, Trash2, Search, User, Save, X, Upload, FileSpreadsheet, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminDashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dbCount, setDbCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Employee Form State
  const [newNatId, setNewNatId] = useState('');
  const [newName, setNewName] = useState('');
  const [newFinId, setNewFinId] = useState('');

  const loadData = async () => {
    // For admin view, we just load first 100 or rely on search to avoid memory bloat
    const all = await dataService.getAllEmployees();
    setEmployees(all.slice(0, 100)); // Show only first 100 for performance
    setDbCount(all.length);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (nid: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء.')) {
      await dataService.deleteEmployee(nid);
      loadData();
    }
  };

  const handleClearAll = async () => {
    if (confirm('تحذير: هذا سيقوم بحذف جميع البيانات من قاعدة البيانات المحلية. هل أنت متأكد تماماً؟')) {
       await dataService.clearAllData();
       loadData();
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newNatId && newName && newFinId) {
      const newEmp = dataService.createTemplateEmployee(newNatId, newName, newFinId);
      await dataService.saveEmployee(newEmp);
      loadData();
      setShowAddModal(false);
      setNewNatId('');
      setNewName('');
      setNewFinId('');
    }
  };

  const processFile = async (data: any[]) => {
    try {
      // 1. Parse all data into memory map (Fast)
      setUploadProgress(10);
      const employeesMap = dataService.parseExcelData(data);
      const employeesList = Object.values(employeesMap);
      
      if (employeesList.length === 0) {
        alert("لم يتم العثور على بيانات صالحة. تأكد من وجود عمود 'الرقم الوطني'.");
        return;
      }

      setUploadProgress(30);

      // 2. Save to IndexedDB in Batches (to avoid UI freeze)
      const BATCH_SIZE = 500;
      const total = employeesList.length;
      
      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = employeesList.slice(i, i + BATCH_SIZE);
        await dataService.saveBulkEmployees(batch);
        
        // Update progress
        const percent = Math.round(30 + ((i + BATCH_SIZE) / total) * 70);
        setUploadProgress(Math.min(percent, 100));
        
        // Yield to main thread to keep UI responsive
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      setUploadProgress(100);
      alert(`تمت العملية بنجاح! تم معالجة ${employeesList.length} موظف.`);
      loadData();

    } catch (error: any) {
      console.error(error);
      alert(`حدث خطأ: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(5);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        
        // Use defval: "" to ensure we get keys even for empty cells
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
        
        processFile(data);
        
      } catch (error) {
        console.error(error);
        setIsUploading(false);
        alert('حدث خطأ أثناء قراءة الملف.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSearch = async (val: string) => {
    setSearchTerm(val);
    if (val.length === 12) {
       const emp = await dataService.getEmployee(val);
       if (emp) setEmployees([emp]);
    } else if (val === '') {
      loadData();
    }
  };

  const displayedEmployees = employees.filter(e => 
    e.fullName.includes(searchTerm) || e.nationalId.includes(searchTerm) || e.financialId.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto p-4 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">لوحة تحكم المسؤولين</h2>
          <p className="text-gray-500 dark:text-gray-400">إدارة قاعدة البيانات (IndexedDB)</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors text-white
              ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isUploading ? <RefreshCw className="animate-spin" size={20} /> : <FileSpreadsheet size={20} />}
            <span>{isUploading ? `جاري المعالجة ${uploadProgress}%` : 'رفع ملف إكسل'}</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          
          <button 
            onClick={() => setShowAddModal(true)}
            disabled={isUploading}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">إضافة يدوي</span>
          </button>
        </div>
      </div>

      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700">
          <div className="bg-green-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
           <div className="text-gray-500 text-sm mb-1">إجمالي السجلات في القاعدة</div>
           <div className="text-3xl font-bold text-primary-600">{dbCount}</div>
           <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
             <Database size={12} />
             <span>مخزن في IndexedDB</span>
           </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
           <div>
             <div className="text-gray-500 text-sm mb-1">إدارة البيانات</div>
             <div className="text-xs text-gray-400">حذف قاعدة البيانات بالكامل</div>
           </div>
           <button 
             onClick={handleClearAll}
             className="text-red-500 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded self-start mt-2 flex items-center gap-1 transition-colors"
           >
             <Trash2 size={12} />
             تصفير النظام
           </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="بحث بالرقم الوطني في القائمة المعروضة..."
            className="w-full pr-10 pl-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors dark:text-white"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">* للعرض: يتم تحميل آخر 100 سجل فقط لتسريع العرض. استخدم البحث للوصول لسجل معين.</p>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">الاسم</th>
                <th className="px-6 py-4 font-semibold">الرقم الوطني</th>
                <th className="px-6 py-4 font-semibold">الرقم المالي</th>
                <th className="px-6 py-4 font-semibold">عدد السجلات</th>
                <th className="px-6 py-4 font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {displayedEmployees.length > 0 ? (
                displayedEmployees.map(emp => (
                  <tr key={emp.nationalId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-gray-800 dark:text-gray-200">
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <User size={16} />
                      </div>
                      {emp.fullName}
                    </td>
                    <td className="px-6 py-4">{emp.nationalId}</td>
                    <td className="px-6 py-4">{emp.financialId}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {emp.records.length} شهر
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDelete(emp.nationalId)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    لا توجد بيانات مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">إضافة موظف جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم الرباعي</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الرقم الوطني</label>
                <input 
                  type="text" 
                  required
                  pattern="\d{12}"
                  maxLength={12}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newNatId}
                  onChange={e => setNewNatId(e.target.value.replace(/\D/g,''))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الرقم المالي</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newFinId}
                  onChange={e => setNewFinId(e.target.value)}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  <span>حفظ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;