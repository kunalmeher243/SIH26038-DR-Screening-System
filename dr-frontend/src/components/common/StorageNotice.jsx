import { useState, useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";
import { Link } from "react-router-dom";
import useLanguageStore from "../../store/useLanguageStore";

const STORAGE_PREF_KEY = "serix_storage_pref";

const noticeContent = {
  en: {
    title: "Privacy & Storage Notice",
    desc: "We use essential local storage to securely maintain your clinician/patient login session and interface language settings. No commercial tracking cookies are deployed.",
    learnMore: "Learn more",
    acceptAll: "Accept All",
    essentialOnly: "Essential Only"
  },
  hi: {
    title: "गोपनीयता एवं स्टोरेज सूचना",
    desc: "हम आपके सुरक्षित लॉगिन सत्र और भाषा प्राथमिकताओं को बनाए रखने के लिए आवश्यक स्थानीय संग्रहण का उपयोग करते हैं। कोई वाणिज्यिक ट्रैकिंग कुकीज़ नहीं हैं।",
    learnMore: "और जानें",
    acceptAll: "सभी स्वीकार करें",
    essentialOnly: "केवल आवश्यक"
  },
  or: {
    title: "ଗୋପନୀୟତା ଏବଂ ଷ୍ଟୋରେଜ୍ ସୂଚନା",
    desc: "ଆମେ ଆପଣଙ୍କ ସୁରକ୍ଷିତ ଲଗଇନ୍ ସେସନ୍ ଏବଂ ଭାଷା ପସନ୍ଦ ପାଇଁ କେବଳ ଆବଶ୍ୟକୀୟ ଲୋକାଲ୍ ଷ୍ଟୋରେଜ୍ ବ୍ୟବହାର କରୁ। କୌଣସି ବ୍ୟବସାୟିକ ଟ୍ରାକିଂ କୁକିଜ୍ ବ୍ୟବହାର କରାଯାଏ ନାହିଁ।",
    learnMore: "ଅଧିକ ଜାଣନ୍ତୁ",
    acceptAll: "ସବୁ ଗ୍ରହଣ କରନ୍ତୁ",
    essentialOnly: "କେବଳ ଆବଶ୍ୟକୀୟ"
  }
};

export default function StorageNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguageStore();
  const c = noticeContent[language] || noticeContent.en;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PREF_KEY);
      if (!stored) {
        // Show banner after brief initial delay for smooth entrance
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Ignore if localStorage unavailable
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_PREF_KEY, "accepted");
    } catch (e) {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem(STORAGE_PREF_KEY, "essential_only");
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Storage and privacy notice"
      style={{
        position: "fixed",
        bottom: "16px",
        left: "16px",
        zIndex: 9999,
        maxWidth: "420px",
        width: "calc(100vw - 32px)",
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        border: "1px solid #D1D5DB",
        boxShadow: "0 12px 36px rgba(15, 23, 42, 0.16)",
        padding: "20px 22px",
        animation: "slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div style={{
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          backgroundColor: "#EFF6FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}>
          <ShieldCheck size={20} color="#1976D2" />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <h4 style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#1E293B",
              margin: 0
            }}>
              {c.title}
            </h4>
            <button
              type="button"
              onClick={handleDecline}
              aria-label="Close notice"
              style={{
                background: "none",
                border: "none",
                color: "#94A3B8",
                cursor: "pointer",
                padding: "2px",
                borderRadius: "4px"
              }}
            >
              <X size={16} />
            </button>
          </div>

          <p style={{
            fontSize: "0.8125rem",
            lineHeight: 1.5,
            color: "#64748B",
            margin: "0 0 14px"
          }}>
            {c.desc}{" "}
            <Link to="/privacy" style={{ color: "#1976D2", fontWeight: 600, textDecoration: "underline" }}>
              {c.learnMore}
            </Link>.
          </p>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleAccept}
              style={{
                flex: 1,
                padding: "8px 14px",
                backgroundColor: "#1976D2",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.825rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.15s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1565C0"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1976D2"; }}
            >
              {c.acceptAll}
            </button>

            <button
              type="button"
              onClick={handleDecline}
              style={{
                flex: 1,
                padding: "8px 14px",
                backgroundColor: "#F1F5F9",
                color: "#475569",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                fontSize: "0.825rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.15s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E2E8F0"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F1F5F9"; }}
            >
              {c.essentialOnly}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
