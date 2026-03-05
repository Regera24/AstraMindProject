import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    // Also set Accept-Language header for API calls
    document.documentElement.lang = lng;
  };

  const currentLanguage = i18n.language || 'vi';

  return (
    <div className="relative inline-block">
      <button
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        onClick={() => changeLanguage(currentLanguage === 'vi' ? 'en' : 'vi')}
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{currentLanguage}</span>
      </button>
    </div>
  );
}
