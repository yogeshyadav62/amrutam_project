import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Storage } from './storageService';

const LANGUAGE_KEY = 'amrutam_app_language';

const resources = {
  en: {
    translation: {
      tabs: {
        consultation: 'Consultation',
        shop: 'Shop',
        records: 'Health Records',
      },
      consultation: {
        title: 'Consultation',
        subtitle: 'Talk to Certified Ayurvedic Doctors',
        searchPlaceholder: 'Search doctors, specialties...',
        verifiedBadge: 'Verified Vaidyas',
        instantConsult: 'Instant Consultation',
        startConsult: 'Start Consultation',
        bookNow: 'Book Now',
        availableToday: 'Available Today',
        experience: 'Years Exp',
        fee: 'Fee',
      },
      shop: {
        title: 'Amrutam Shop',
        subtitle: 'Authentic Ayurvedic Formulations',
        searchPlaceholder: 'Search oils, malts, hair care...',
        addToCart: '+ Add to Cart',
        offerTitle: 'Flat 20% OFF',
      },
      records: {
        title: 'Health Records',
        subtitle: 'Prescriptions, Reports & Dosha Profile',
        upload: '+ Upload Record',
        doshaProfile: 'Prakriti Balance Profile',
      },
      common: {
        loading: 'Loading...',
        retry: 'Retry',
        offlineNotice: 'You are offline. Showing cached data.',
        success: 'Success',
        error: 'Error',
      },
    },
  },
  hi: {
    translation: {
      tabs: {
        consultation: 'परामर्श (Consultation)',
        shop: 'दुकान (Shop)',
        records: 'स्वास्थ्य रिकॉर्ड (Records)',
      },
      consultation: {
        title: 'आयुर्वेदिक परामर्श',
        subtitle: 'प्रमाणित वैद्यों से परामर्श लें',
        searchPlaceholder: 'डॉक्टर, विशेषता खोजें...',
        verifiedBadge: 'प्रमाणित वैद्य',
        instantConsult: 'तुरंत परामर्श',
        startConsult: 'परामर्श शुरू करें',
        bookNow: 'अभी बुक करें',
        availableToday: 'आज उपलब्ध',
        experience: 'वर्ष अनुभव',
        fee: 'शुल्क',
      },
      shop: {
        title: 'अमृतम शॉप',
        subtitle: 'प्रामाणिक आयुर्वेदिक औषधियां',
        searchPlaceholder: 'तेल, अवलेह, केश केयर खोजें...',
        addToCart: '+ कार्ट में जोड़ें',
        offerTitle: '20% की छूट',
      },
      records: {
        title: 'स्वास्थ्य रिकॉर्ड',
        subtitle: 'प्रिस्क्रिप्शन, रिपोर्ट एवं दोष प्रोफाइल',
        upload: '+ रिकॉर्ड अपलोड करें',
        doshaProfile: 'प्रकृति संतुलन प्रोफाइल',
      },
      common: {
        loading: 'लोड हो रहा है...',
        retry: 'पुनः प्रयास करें',
        offlineNotice: 'आप ऑफ़लाइन हैं। सहेजा गया डेटा दिखाया जा रहा है।',
        success: 'सफल',
        error: 'त्रुटि',
      },
    },
  },
};

const savedLang = Storage.getItem<string>(LANGUAGE_KEY, 'en') || 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = (lang: 'en' | 'hi') => {
  i18n.changeLanguage(lang);
  Storage.setItem(LANGUAGE_KEY, lang);
};

export default i18n;
