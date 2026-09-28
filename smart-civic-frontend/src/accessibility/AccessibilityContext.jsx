import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import i18n from "../i18n/i18n";

const AccessibilityContext = createContext(null);
const KEY = "civicflow-accessibility-v3";
const DEFAULTS = {
  highContrast: false,
  textStage: 0,
  captions: false,
  transcripts: false,
  audioControls: false,
  narrator: true,
  narratorVolume: 1,
  narratorRate: 0.9,
  keyboard: false,
  focus: false,
  largeTargets: false,
  predictable: false,
  clearLanguage: false,
  reducedMotion: false,
  alternativeText: true,
};

const stages = [1, 1.1, 1.25, 1.4, 1.6, 1.8, 2];

export function AccessibilityProvider({ children }) {
  const location = useLocation();
  const [settings, setSettings] = useState(() => {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
    catch { return DEFAULTS; }
  });
  const [narratorVisible, setNarratorVisible] = useState(false);
  const [narratorMessage, setNarratorMessage] = useState("");
  const [transcript, setTranscript] = useState([]);
  const narratorTimerRef = useRef(null);
  const localeMap = { en: "en-IN", hi: "hi-IN", bn: "bn-IN", mr: "mr-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN", ml: "ml-IN", gu: "gu-IN", pa: "pa-IN" };
  const narratorCopy = {
    en: "Accessibility narrator is on. Click any button, link, field, or navigation control once to hear what it does. Click the same control a second time to activate it. You can turn the narrator off from Accessibility settings at any time.",
    hi: "एक्सेसिबिलिटी नैरेटर चालू है। किसी बटन, लिंक, फ़ील्ड या नेविगेशन कंट्रोल को एक बार दबाकर सुनें कि वह क्या करता है। उसी कंट्रोल को दूसरी बार दबाने पर वह सक्रिय होगा। आप Accessibility सेटिंग्स से नैरेटर कभी भी बंद कर सकते हैं।",
    bn: "অ্যাক্সেসিবিলিটি ন্যারেটর চালু আছে। কোনো বোতাম, লিঙ্ক, ফিল্ড বা নেভিগেশন কন্ট্রোলে একবার ক্লিক করলে এটি কী করে তা শোনা যাবে। একই কন্ট্রোলে দ্বিতীয়বার ক্লিক করলে সেটি সক্রিয় হবে। Accessibility সেটিংস থেকে ন্যারেটর যেকোনো সময় বন্ধ করা যাবে।",
    mr: "अॅक्सेसिबिलिटी नॅरेटर सुरू आहे. कोणत्याही बटणावर, लिंकवर, फील्डवर किंवा नेव्हिगेशन कंट्रोलवर एकदा क्लिक केल्यास त्याचे कार्य ऐकू येईल. त्याच कंट्रोलवर दुसऱ्यांदा क्लिक केल्यास ते सक्रिय होईल. Accessibility सेटिंग्जमधून नॅरेटर कधीही बंद करता येतो.",
    ta: "அணுகல்தன்மை நேரேட்டர் இயக்கத்தில் உள்ளது. எந்த பொத்தான், இணைப்பு, புலம் அல்லது வழிசெலுத்தல் கட்டுப்பாட்டையும் ஒருமுறை கிளிக் செய்தால் அது என்ன செய்கிறது என்பதை கேட்கலாம். அதே கட்டுப்பாட்டை இரண்டாவது முறை கிளிக் செய்தால் அது செயல்படும். Accessibility அமைப்புகளில் இருந்து நேரேட்டரை எப்போது வேண்டுமானாலும் நிறுத்தலாம்.",
    te: "యాక్సెసిబిలిటీ నేరేటర్ ఆన్‌లో ఉంది. ఏ బటన్, లింక్, ఫీల్డ్ లేదా నావిగేషన్ కంట్రోల్‌పై ఒకసారి క్లిక్ చేస్తే అది ఏమి చేస్తుందో వినవచ్చు. అదే కంట్రోల్‌ను రెండోసారి క్లిక్ చేస్తే అది యాక్టివ్ అవుతుంది. Accessibility సెట్టింగ్స్‌లో నుంచి నేరేటర్‌ను ఎప్పుడైనా ఆఫ్ చేయవచ్చు.",
    kn: "ಪ್ರವೇಶಾರ್ಹತಾ ನ್ಯಾರೇಟರ್ ಆನ್ ಆಗಿದೆ. ಯಾವುದೇ ಬಟನ್, ಲಿಂಕ್, ಕ್ಷೇತ್ರ ಅಥವಾ ನ್ಯಾವಿಗೇಶನ್ ನಿಯಂತ್ರಣವನ್ನು ಒಮ್ಮೆ ಕ್ಲಿಕ್ ಮಾಡಿದರೆ ಅದು ಏನು ಮಾಡುತ್ತದೆ ಎಂದು ಕೇಳಬಹುದು. ಅದೇ ನಿಯಂತ್ರಣವನ್ನು ಎರಡನೇ ಬಾರಿ ಕ್ಲಿಕ್ ಮಾಡಿದರೆ ಅದು ಸಕ್ರಿಯವಾಗುತ್ತದೆ. Accessibility ಸೆಟ್ಟಿಂಗ್‌ಗಳಿಂದ ನ್ಯಾರೇಟರ್ ಅನ್ನು ಯಾವಾಗ ಬೇಕಾದರೂ ಆಫ್ ಮಾಡಬಹುದು.",
    ml: "ആക്സസിബിലിറ്റി നറേറ്റർ ഓണാണ്. ഏതെങ്കിലും ബട്ടൺ, ലിങ്ക്, ഫീൽഡ് അല്ലെങ്കിൽ നാവിഗേഷൻ നിയന്ത്രണം ഒരിക്കൽ ക്ലിക്ക് ചെയ്താൽ അത് എന്താണ് ചെയ്യുന്നതെന്ന് കേൾക്കാം. അതേ നിയന്ത്രണം രണ്ടാമത് ക്ലിക്ക് ചെയ്താൽ അത് പ്രവർത്തിക്കും. Accessibility ക്രമീകരണങ്ങളിൽ നിന്ന് നറേറ്റർ എപ്പോൾ വേണമെങ്കിലും ഓഫ് ചെയ്യാം.",
    gu: "ઍક્સેસિબિલિટી નેરેટર ચાલુ છે. કોઈપણ બટન, લિંક, ફીલ્ડ અથવા નેવિગેશન કંટ્રોલ પર એક વાર ક્લિક કરવાથી તે શું કરે છે તે સાંભળી શકાય છે. એ જ કંટ્રોલ પર બીજી વાર ક્લિક કરવાથી તે સક્રિય થશે. Accessibility સેટિંગ્સમાંથી નેરેટર ક્યારેય પણ બંધ કરી શકાય છે.",
    pa: "ਐਕਸੈਸਿਬਿਲਿਟੀ ਨੈਰੇਟਰ ਚਾਲੂ ਹੈ। ਕਿਸੇ ਵੀ ਬਟਨ, ਲਿੰਕ, ਫੀਲਡ ਜਾਂ ਨੇਵੀਗੇਸ਼ਨ ਕੰਟਰੋਲ 'ਤੇ ਇੱਕ ਵਾਰ ਕਲਿੱਕ ਕਰਨ ਨਾਲ ਉਸਦਾ ਕੰਮ ਸੁਣਿਆ ਜਾ ਸਕਦਾ ਹੈ। ਉਸੇ ਕੰਟਰੋਲ 'ਤੇ ਦੂਜੀ ਵਾਰ ਕਲਿੱਕ ਕਰਨ ਨਾਲ ਉਹ ਸਰਗਰਮ ਹੋਵੇਗਾ। Accessibility ਸੈਟਿੰਗਾਂ ਤੋਂ ਨੈਰੇਟਰ ਕਿਸੇ ਵੀ ਸਮੇਂ ਬੰਦ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ."
  };
  const isAuth = location.pathname === "/login" || location.pathname === "/";

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.cfTextScale = String(settings.textStage);
    root.style.setProperty("--cf-text-scale", String(stages[settings.textStage]));
    root.classList.toggle("cf-high-contrast", settings.highContrast);
    root.classList.toggle("cf-large-targets", settings.largeTargets);
    root.classList.toggle("cf-reduced-motion", settings.reducedMotion);
    root.classList.toggle("cf-focus-visible", settings.focus);
    root.classList.toggle("cf-predictable-layout", settings.predictable);
    root.classList.toggle("cf-clear-language", settings.clearLanguage);
    return () => {};
  }, [settings]);

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));
  const reset = () => setSettings(DEFAULTS);

  const speak = (text, opts = {}) => {
    if (!("speechSynthesis" in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = settings.audioControls ? settings.narratorVolume : 1;
    utterance.rate = settings.audioControls ? settings.narratorRate : 1;
    utterance.lang = opts.lang || localeMap[i18n.language] || "en-IN";
    window.speechSynthesis.speak(utterance);
    setNarratorMessage(text);
    setTranscript((items) => [...items.slice(-4), text]);
  };

  const keepNarratorOpen = () => {
    if (narratorTimerRef.current) window.clearTimeout(narratorTimerRef.current);
    narratorTimerRef.current = window.setTimeout(() => setNarratorVisible(false), 10000);
  };

  const showNarrator = (text) => {
    if (isAuth || !settings.narrator) return;
    setNarratorMessage(text);
    setNarratorVisible(true);
    speak(text);
    keepNarratorOpen();
  };

  // When the narrator is enabled, the first click on an actionable control
  // only describes it. The second click on that same control performs the
  // original action. This is deliberately handled at the document level so
  // it also works for dynamically rendered buttons, links and form controls.
  useEffect(() => {
    if (isAuth || !settings.narrator) return undefined;

    let lastTarget = null;
    let lastTime = 0;
    const selector = 'button, a, input, select, textarea, summary, [role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="tab"], [role="menuitem"], [role="option"], [data-narrate]';

    const getLabel = (el) => {
      const labelledBy = el.getAttribute('aria-labelledby');
      if (labelledBy) {
        const text = labelledBy.split(/\s+/).map(id => document.getElementById(id)?.innerText || '').join(' ').trim();
        if (text) return text;
      }
      const aria = el.getAttribute('aria-label');
      if (aria) return aria;
      const title = el.getAttribute('title');
      if (title) return title;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
        const id = el.getAttribute('id');
        if (id) {
          const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
          if (label?.innerText) return `${label.innerText.trim()} field`;
        }
        const placeholder = el.getAttribute('placeholder');
        if (placeholder) return `${placeholder} field`;
      }
      const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      return text.slice(0, 180) || 'Interactive control';
    };

    const describe = (el) => {
      const tag = el.tagName.toLowerCase();
      const label = getLabel(el);
      const role = el.getAttribute('role');
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        const type = el.getAttribute('type');
        const kind = type === 'checkbox' || type === 'radio' ? type : 'input';
        return `${label}. ${kind}. Click again to use this control.`;
      }
      if (tag === 'a' || role === 'link') return `${label}. Link. Click again to open it.`;
      if (tag === 'button' || role === 'button' || role === 'tab' || role === 'menuitem') return `${label}. Button. Click again to activate it.`;
      return `${label}. Click again to continue.`;
    };

    const onClick = (event) => {
      const target = event.target?.closest?.(selector);
      if (!target || !document.contains(target)) return;
      if (target.closest('.narrator-bubble') || target.closest('[data-narrator-control]')) return;
      if (target.disabled || target.getAttribute('aria-disabled') === 'true') return;

      const now = Date.now();
      const sameTarget = target === lastTarget && now - lastTime <= 5000;
      if (sameTarget) {
        lastTarget = null;
        lastTime = 0;
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      lastTarget = target;
      lastTime = now;
      speak(describe(target));
      setNarratorVisible(true);
      keepNarratorOpen();
      window.setTimeout(() => {
        if (Date.now() - lastTime > 5000) { lastTarget = null; lastTime = 0; }
      }, 5100);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [isAuth, settings.narrator, settings.audioControls, settings.narratorVolume, settings.narratorRate, i18n.language]);

  useEffect(() => {
    if (isAuth || !settings.narrator) {
      window.speechSynthesis?.cancel();
      setNarratorVisible(false);
      return;
    }
    const seenKey = 'civicflow-narrator-welcomed-v3';
    if (!sessionStorage.getItem(seenKey)) {
      sessionStorage.setItem(seenKey, '1');
      showNarrator(narratorCopy[i18n.language] || narratorCopy.en);
    }
    return () => {
      window.speechSynthesis?.cancel();
      if (narratorTimerRef.current) window.clearTimeout(narratorTimerRef.current);
    };
  }, [location.pathname, isAuth, settings.narrator]);

  const value = useMemo(() => ({
    settings, stages, update, reset, speak, showNarrator,
    narratorVisible, narratorMessage, transcript,
    narratorLocale: localeMap[i18n.language] || "en-IN",
    dismissNarrator: () => {
      window.speechSynthesis?.cancel();
      if (narratorTimerRef.current) window.clearTimeout(narratorTimerRef.current);
      setNarratorVisible(false);
    },
  }), [settings, narratorVisible, narratorMessage]);

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() { return useContext(AccessibilityContext); }
