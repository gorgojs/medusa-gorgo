import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"
import { defaultI18nOptions } from "../../i18n/config"

if (!i18n.isInitialized) {
  i18n
    .use(
      new LanguageDetector(null, {
        lookupCookie: "lng",
        lookupLocalStorage: "lng",
      })
    )
    .use(initReactI18next)
    .init(defaultI18nOptions)
}

export const I18n = () => null

export { i18n }