// -----------------------------------------------------------------------------
// i18n.js — Internationalization configuration
// -----------------------------------------------------------------------------
// i18next stores the translated UI strings here.
//
// IMPORTANT FOR TEAM:
// Components should use `t("translationKey")` instead of hard-coding visible UI
// labels. This is what allows the same screen to switch between Indian languages.
//
// English is the fallback language so a missing translation does not leave the
// interface blank.
// -----------------------------------------------------------------------------

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Each key below is a stable translation key. Keep the same keys in every language where possible.
const resources = {
  en: {
    translation: {
      appName: "CivicFlow",
      appTag: "Smart civic issue management",
      citizen: "Citizen",
      admin: "Municipal Admin",
      dashboard: "Dashboard",
      complaints: "Complaints",
      newComplaint: "Report an Issue",
      myComplaints: "My Complaints",
      analytics: "Analytics",
      settings: "Settings",
      welcome: "Good afternoon",
      overview: "Here’s what’s happening with civic issues around you.",
      active: "Active complaints",
      resolved: "Resolved",
      urgent: "High priority",
      response: "Avg. response",
      reportIssue: "Report a civic issue",
      reportHint: "Tell us what happened. Add a location and priority so the right team can act faster.",
      category: "Category",
      description: "Description",
      location: "Location",
      priority: "Priority",
      submit: "Submit complaint",
      useLocation: "Use current location",
      attachPhoto: "Add photo",
      optional: "Optional",
      recent: "Recent complaints",
      viewAll: "View all",
      track: "Track complaint",
      status: "Status",
      new: "New",
      assigned: "Assigned",
      inProgress: "In Progress",
      resolvedStatus: "Resolved",
      issueDistribution: "Issue distribution",
      aging: "Aging complaints",
      highLocations: "High-priority locations",
      sla: "SLA performance",
      needsAttention: "Needs attention",
      allClear: "All caught up",
      assign: "Assign",
      addComment: "Add comment",
      save: "Save",
      cancel: "Cancel",
      search: "Search complaints",
      filters: "Filters",
      all: "All",
      streetlight: "Other",
      pothole: "Pothole",
      garbage: "Garbage",
      water: "Road Damage",
      drainage: "Other",
      other: "Other",
      low: "Low",
      medium: "Medium",
      high: "High",
      anonymous: "Submit anonymously",
      aiAssist: "Smart assist",
      aiHint: "Classify and extract useful details from your description",
      queue: "Operations queue",
      queueHint: "Prioritize work using age, category and similar complaint volume.",
      today: "Today",
      thisWeek: "This week",
      language: "Language",
      logout: "Sign out",
      citizenPortal: "Citizen portal",
      operations: "Operations center",
      complaintId: "Complaint ID",
      reported: "Reported",
      assignedTo: "Assigned to",
      slaDue: "SLA due",
      priorityScore: "Priority score"
    }
  },
  hi: {
    translation: {
      appName: "CivicFlow", appTag: "स्मार्ट नागरिक शिकायत प्रबंधन", citizen: "नागरिक", admin: "नगरपालिका एडमिन",
      dashboard: "डैशबोर्ड", complaints: "शिकायतें", newComplaint: "समस्या दर्ज करें", myComplaints: "मेरी शिकायतें",
      analytics: "विश्लेषण", settings: "सेटिंग्स", welcome: "नमस्कार", overview: "आपके आसपास की नागरिक समस्याओं की स्थिति यहाँ देखें।",
      active: "सक्रिय शिकायतें", resolved: "समाधान", urgent: "उच्च प्राथमिकता", response: "औसत प्रतिक्रिया",
      reportIssue: "नागरिक समस्या दर्ज करें", reportHint: "क्या हुआ बताएं। सही टीम को जल्दी कार्रवाई में मदद करने के लिए स्थान और प्राथमिकता जोड़ें।",
      category: "श्रेणी", description: "विवरण", location: "स्थान", priority: "प्राथमिकता", submit: "शिकायत भेजें",
      useLocation: "वर्तमान स्थान", attachPhoto: "फोटो जोड़ें", optional: "वैकल्पिक", recent: "हाल की शिकायतें", viewAll: "सभी देखें",
      track: "शिकायत ट्रैक करें", status: "स्थिति", new: "नई", assigned: "सौंपी गई", inProgress: "प्रगति में", resolvedStatus: "समाधान हुआ",
      issueDistribution: "समस्या वितरण", aging: "पुरानी शिकायतें", highLocations: "उच्च-प्राथमिकता स्थान", sla: "SLA प्रदर्शन",
      needsAttention: "ध्यान आवश्यक", allClear: "सब ठीक है", assign: "सौंपें", addComment: "टिप्पणी जोड़ें", save: "सहेजें",
      cancel: "रद्द करें", search: "शिकायत खोजें", filters: "फ़िल्टर", all: "सभी", streetlight: "स्ट्रीटलाइट",
      pothole: "गड्ढा / सड़क", garbage: "कचरा / अपशिष्ट", water: "जल आपूर्ति", drainage: "जल निकासी", other: "अन्य",
      low: "कम", medium: "मध्यम", high: "उच्च", anonymous: "गुमनाम रूप से भेजें", aiAssist: "स्मार्ट सहायता",
      aiHint: "विवरण से उपयोगी जानकारी और श्रेणी पहचानें", queue: "ऑपरेशंस कतार",
      queueHint: "उम्र, श्रेणी और समान शिकायतों की संख्या से काम की प्राथमिकता तय करें।",
      today: "आज", thisWeek: "इस सप्ताह", language: "भाषा", logout: "साइन आउट",
      citizenPortal: "नागरिक पोर्टल", operations: "ऑपरेशंस सेंटर", complaintId: "शिकायत ID", reported: "रिपोर्ट की गई",
      assignedTo: "सौंपी गई", slaDue: "SLA समय", priorityScore: "प्राथमिकता स्कोर"
    }
  },
  bn: { translation: { appName:"CivicFlow", appTag:"স্মার্ট নাগরিক অভিযোগ ব্যবস্থাপনা", dashboard:"ড্যাশবোর্ড", complaints:"অভিযোগ", newComplaint:"সমস্যা জানান", myComplaints:"আমার অভিযোগ", analytics:"বিশ্লেষণ", settings:"সেটিংস", citizen:"নাগরিক", admin:"পৌর প্রশাসন", submit:"অভিযোগ জমা দিন", category:"বিভাগ", description:"বিবরণ", location:"স্থান", priority:"অগ্রাধিকার", recent:"সাম্প্রতিক অভিযোগ", status:"অবস্থা", new:"নতুন", assigned:"বরাদ্দ", inProgress:"চলমান", resolvedStatus:"সমাধান হয়েছে", language:"ভাষা", logout:"সাইন আউট" } },
  mr: { translation: { appName:"CivicFlow", appTag:"स्मार्ट नागरिक तक्रार व्यवस्थापन", dashboard:"डॅशबोर्ड", complaints:"तक्रारी", newComplaint:"समस्या नोंदवा", myComplaints:"माझ्या तक्रारी", analytics:"विश्लेषण", settings:"सेटिंग्ज", citizen:"नागरिक", admin:"महानगरपालिका प्रशासक", submit:"तक्रार पाठवा", category:"वर्ग", description:"वर्णन", location:"ठिकाण", priority:"प्राधान्य", status:"स्थिती", new:"नवीन", assigned:"नियुक्त", inProgress:"प्रगतीत", resolvedStatus:"निराकरण झाले", language:"भाषा", logout:"साइन आउट" } },
  ta: { translation: { appName:"CivicFlow", appTag:"ஸ்மார்ட் குடிமக்கள் புகார் மேலாண்மை", dashboard:"டாஷ்போர்டு", complaints:"புகார்கள்", newComplaint:"சிக்கலைப் புகாரளிக்கவும்", myComplaints:"என் புகார்கள்", analytics:"பகுப்பாய்வு", settings:"அமைப்புகள்", citizen:"குடிமகன்", admin:"நகராட்சி நிர்வாகம்", submit:"புகாரை சமர்ப்பிக்கவும்", category:"வகை", description:"விளக்கம்", location:"இடம்", priority:"முன்னுரிமை", status:"நிலை", new:"புதியது", assigned:"ஒதுக்கப்பட்டது", inProgress:"முன்னேற்றத்தில்", resolvedStatus:"தீர்க்கப்பட்டது", language:"மொழி", logout:"வெளியேறு" } },
  te: { translation: { appName:"CivicFlow", appTag:"స్మార్ట్ పౌర ఫిర్యాదు నిర్వహణ", dashboard:"డ్యాష్‌బోర్డ్", complaints:"ఫిర్యాదులు", newComplaint:"సమస్యను నివేదించండి", myComplaints:"నా ఫిర్యాదులు", analytics:"విశ్లేషణ", settings:"సెట్టింగ్స్", citizen:"పౌరుడు", admin:"మున్సిపల్ అడ్మిన్", submit:"ఫిర్యాదు సమర్పించండి", category:"వర్గం", description:"వివరణ", location:"స్థానం", priority:"ప్రాధాన్యత", status:"స్థితి", new:"కొత్తది", assigned:"కేటాయించబడింది", inProgress:"పురోగతిలో", resolvedStatus:"పరిష్కరించబడింది", language:"భాష", logout:"సైన్ అవుట్" } },
  kn: { translation: { appName:"CivicFlow", appTag:"ಸ್ಮಾರ್ಟ್ ನಾಗರಿಕ ದೂರು ನಿರ್ವಹಣೆ", dashboard:"ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", complaints:"ದೂರುಗಳು", newComplaint:"ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ", myComplaints:"ನನ್ನ ದೂರುಗಳು", analytics:"ವಿಶ್ಲೇಷಣೆ", settings:"ಸೆಟ್ಟಿಂಗ್‌ಗಳು", citizen:"ನಾಗರಿಕ", admin:"ನಗರಸಭೆ ನಿರ್ವಾಹಕ", submit:"ದೂರು ಸಲ್ಲಿಸಿ", category:"ವರ್ಗ", description:"ವಿವರಣೆ", location:"ಸ್ಥಳ", priority:"ಆದ್ಯತೆ", status:"ಸ್ಥಿತಿ", new:"ಹೊಸ", assigned:"ನಿಯೋಜಿಸಲಾಗಿದೆ", inProgress:"ಪ್ರಗತಿಯಲ್ಲಿದೆ", resolvedStatus:"ಪರಿಹರಿಸಲಾಗಿದೆ", language:"ಭಾಷೆ", logout:"ಸೈನ್ ಔಟ್" } },
  ml: { translation: { appName:"CivicFlow", appTag:"സ്മാർട്ട് പൗര പരാതി മാനേജ്മെന്റ്", dashboard:"ഡാഷ്ബോർഡ്", complaints:"പരാതികൾ", newComplaint:"പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക", myComplaints:"എന്റെ പരാതികൾ", analytics:"വിശകലനം", settings:"ക്രമീകരണങ്ങൾ", citizen:"പൗരൻ", admin:"മുനിസിപ്പൽ അഡ്മിൻ", submit:"പരാതി സമർപ്പിക്കുക", category:"വിഭാഗം", description:"വിവരണം", location:"സ്ഥലം", priority:"മുൻഗണന", status:"നില", new:"പുതിയത്", assigned:"അസൈൻ ചെയ്തു", inProgress:"പുരോഗതിയിൽ", resolvedStatus:"പരിഹരിച്ചു", language:"ഭാഷ", logout:"സൈൻ ഔട്ട്" } },
  gu: { translation: { appName:"CivicFlow", appTag:"સ્માર્ટ નાગરિક ફરિયાદ વ્યવસ્થાપન", dashboard:"ડેશબોર્ડ", complaints:"ફરિયાદો", newComplaint:"સમસ્યા નોંધાવો", myComplaints:"મારી ફરિયાદો", analytics:"વિશ્લેષણ", settings:"સેટિંગ્સ", citizen:"નાગરિક", admin:"મ્યુનિસિપલ એડમિન", submit:"ફરિયાદ સબમિટ કરો", category:"શ્રેણી", description:"વર્ણન", location:"સ્થાન", priority:"પ્રાથમિકતા", status:"સ્થિતિ", new:"નવી", assigned:"સોંપાયેલ", inProgress:"પ્રગતિમાં", resolvedStatus:"ઉકેલાયેલ", language:"ભાષા", logout:"સાઇન આઉટ" } },
  pa: { translation: { appName:"CivicFlow", appTag:"ਸਮਾਰਟ ਨਾਗਰਿਕ ਸ਼ਿਕਾਇਤ ਪ੍ਰਬੰਧਨ", dashboard:"ਡੈਸ਼ਬੋਰਡ", complaints:"ਸ਼ਿਕਾਇਤਾਂ", newComplaint:"ਸਮੱਸਿਆ ਦਰਜ ਕਰੋ", myComplaints:"ਮੇਰੀਆਂ ਸ਼ਿਕਾਇਤਾਂ", analytics:"ਵਿਸ਼ਲੇਸ਼ਣ", settings:"ਸੈਟਿੰਗਾਂ", citizen:"ਨਾਗਰਿਕ", admin:"ਨਗਰ ਪ੍ਰਸ਼ਾਸਨ", submit:"ਸ਼ਿਕਾਇਤ ਜਮ੍ਹਾਂ ਕਰੋ", category:"ਸ਼੍ਰੇਣੀ", description:"ਵੇਰਵਾ", location:"ਟਿਕਾਣਾ", priority:"ਤਰਜੀਹ", status:"ਸਥਿਤੀ", new:"ਨਵੀਂ", assigned:"ਸੌਂਪੀ", inProgress:"ਤਰੱਕੀ ਵਿੱਚ", resolvedStatus:"ਹੱਲ ਹੋਇਆ", language:"ਭਾਸ਼ਾ", logout:"ਸਾਈਨ ਆਊਟ" } }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
