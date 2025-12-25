import React, { useState, useEffect } from 'react';
import { Search, CreditCard, AlertCircle, Sparkles, School } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Employee } from '../types';
import Logo from './Logo';

interface InquiryFormProps {
  onResult: (employee: Employee | null) => void;
}

const InquiryForm: React.FC<InquiryFormProps> = ({ onResult }) => {
  const [nationalId, setNationalId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [empCount, setEmpCount] = useState<number>(0);

  useEffect(() => {
    dataService.getCount().then(count => setEmpCount(count));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    onResult(null);

    // Simulate a small delay for better UX feel
    await new Promise(r => setTimeout(r, 800));

    try {
      if (!nationalId.trim()) {
        setError('الرجاء إدخال الرقم الوطني');
        setLoading(false);
        return;
      }

      if (!/^\d{12}$/.test(nationalId.trim())) {
        setError('الرقم الوطني يجب أن يتكون من 12 خانة');
        setLoading(false);
        return;
      }

      const employee = await dataService.getEmployee(nationalId.trim());
      
      if (employee) {
        onResult(employee);
      } else {
        setError('عذراً، لم يتم العثور على بيانات مطابقة لهذا الرقم.');
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ فني أثناء الاتصال بقاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto relative animate-fade-in px-4">
      
      {/* Decorative Glow behind card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-primary-400/20 via-purple-400/20 to-teal-400/20 blur-3xl rounded-full -z-10 opacity-70"></div>

      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/60 dark:border-gray-700 p-8 md:p-12 transition-all duration-300 hover:shadow-primary-500/10">
        
        <div className="text-center mb-10">
          <div className="flex justify-center mb-8 relative">
            {/* Logo Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-500/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg ring-1 ring-gray-100 dark:ring-gray-700">
               <Logo className="h-40 w-40 md:h-48 md:w-48" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-2 tracking-tight">
            مراقبة التربية والتعليم
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">
            ببلدية سلوق
          </h2>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-sm font-medium">
             <School size={16} />
             <span>مكتب الموارد البشرية</span>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mr-2 block">
              أدخل الرقم الوطني للاستعلام
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-gray-400 group-focus-within:text-primary-600 transition-colors duration-300">
                <CreditCard size={24} strokeWidth={1.5} />
              </div>
              <input
                type="text"
                className="w-full pl-5 pr-14 py-4 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 focus:border-primary-500 outline-none transition-all duration-300 text-xl font-bold text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 shadow-inner text-center tracking-widest"
                placeholder="119950307526"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                maxLength={12}
                dir="ltr" 
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl text-sm animate-fade-in shadow-sm">
              <AlertCircle size={20} className="shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl text-white font-bold text-xl shadow-xl shadow-primary-600/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-[0.98] duration-300
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-primary-600 via-teal-600 to-primary-700 hover:shadow-primary-600/30'
              }`}
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>جاري البحث...</span>
              </>
            ) : (
              <>
                <Search size={24} strokeWidth={2.5} />
                <span>عرض البيانات</span>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-3">
           <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider font-semibold">
             <Sparkles size={12} />
             <span>حالة المنظومة</span>
           </div>
           <p className="text-base text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 px-6 py-2 rounded-full border border-gray-100 dark:border-gray-700/50">
             عدد الموظفين المسجلين: <span className="font-extrabold text-primary-600 dark:text-primary-400">{empCount.toLocaleString()}</span>
           </p>
        </div>
      </div>
    </div>
  );
};

export default InquiryForm;