import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import Italian translations
import itCommon from './locales/it/common.json';
import itLanding from './locales/it/landing.json';
import itApp from './locales/it/app.json';
import itAuth from './locales/it/auth.json';
import itSeo from './locales/it/seo.json';
import itAssets from './locales/it/assets.json';

// Import English translations
import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enApp from './locales/en/app.json';
import enAuth from './locales/en/auth.json';
import enSeo from './locales/en/seo.json';
import enAssets from './locales/en/assets.json';

// Define resources
const resources = {
  it: {
    common: itCommon,
    landing: itLanding,
    app: itApp,
    auth: itAuth,
    seo: itSeo,
    assets: itAssets,
  },
  en: {
    common: enCommon,
    landing: enLanding,
    app: enApp,
    auth: enAuth,
    seo: enSeo,
    assets: enAssets,
  },
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'it', // Default language
    defaultNS: 'common', // Default namespace
    ns: ['common', 'landing', 'app', 'auth', 'seo', 'assets'], // Available namespaces

    detection: {
      // Order and from where user language should be detected
      order: ['querystring', 'localStorage', 'navigator'],
      // Keys or params to lookup language from
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'i18nextLng',
      // Cache user language
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already safes from XSS
    },

    // Debug mode (disable in production)
    debug: false,
  });

export default i18n;
