import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

export const defaultLanguage = "en";

export const supportedLanguages = [
  { code: "en", name: "English" },
  { code: "ch", name: "简体中文" },
];

i18next
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({

	supportedLngs: supportedLanguages.map((lang) => lang.code),

    // backend: {
    //   loadPath: `./locales/{{lng}}.json`
    // },
    // react: {
    //   	useSuspense: true,
	  // 	transSupportBasicHtmlNodes: true,
		// transKeepBasicHtmlNodesFor: ['u', 'a']
    // },
    fallbackLng: defaultLanguage,
    keySeparator: '.',
    interpolation: { escapeValue: false }
  })

export default i18next

export function languageCodeOnly(fullyQualifiedCode) {
	return fullyQualifiedCode.split("-")[0];
}