import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t dark:border-gray-800 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} مراقبة التربية والتعليم سلوق - مكتب الموارد البشرية
        </p>
        <p className="text-gray-400 dark:text-gray-600 text-xs mt-2">
          تم التطوير للأغراض الإدارية
        </p>
      </div>
    </footer>
  );
};

export default Footer;
