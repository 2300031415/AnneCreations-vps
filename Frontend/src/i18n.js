import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

// Import resources directly to speed up initialization and help with build-time rendering
import translationEN from '../public/locales/en/translation.json';
import translationHI from '../public/locales/hi/translation.json';
import translationTE from '../public/locales/te/translation.json';

const resources = {
    en: { translation: translationEN },
    hi: { translation: translationHI },
    te: { translation: translationTE },
};

i18n
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources, // Use pre-loaded resources
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        load: 'languageOnly',
        supportedLngs: ['en', 'hi', 'te'],
        nonExplicitSupportedLngs: false,
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'selectedLanguage',
        },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },
        // Wait for resources only on the client
        react: {
            useSuspense: false, // Prevents i18next from hanging the build by suspending
        },
    });

export default i18n;

