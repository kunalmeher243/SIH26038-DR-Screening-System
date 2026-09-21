import { Shield, Lock, ArrowLeft, Database, Eye, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import usePageMeta from "../utils/usePageMeta";
import useLanguageStore from "../store/useLanguageStore";

const privacyContent = {
  en: {
    backBtn: "Back to Screening Portal",
    kicker: "CLINICAL DATA GOVERNANCE & PRIVACY",
    title: "Privacy Policy & Data Security",
    effectiveDate: "Effective Date: September 2026 | Compliant with IEC 62304, HIPAA Security Rule, and Good Machine Learning Practice (GMLP).",
    s1Title: "1. Information We Collect",
    s1Intro: "SERIX collects information necessary to execute AI-assisted retinal screening and tele-ophthalmology triage:",
    s1Items: [
      { label: "Retinal Fundus Photography", desc: "High-resolution digital images of the retina uploaded via Primary Health Centres (PHC) or screening clinics." },
      { label: "De-Identified Clinical Metadata", desc: "Age, systemic history (e.g., duration of diabetes, HbA1c brackets), and image quality metrics." },
      { label: "Account Credentials", desc: "Name, professional email, and role authorization (PHC Worker, Ophthalmologist, or Patient) for secure portal access." }
    ],
    s2Title: "2. Zero-Retention Inference & Anonymization",
    s2Desc: "Image processing through our deep learning pipeline (CLAHE enhancement, lesion detection, and Grad-CAM visualization) is performed in memory. Retinal scans are stored in encrypted object repositories using SHA-256 pseudonyms to ensure patient confidentiality and eliminate direct linkage to personally identifiable records without explicit clinical authorization.",
    s3Title: "3. Data Storage & Local Storage Usage",
    s3Intro: "SERIX utilizes modern browser web storage (`localStorage`) strictly for essential application functions:",
    s3Items: [
      "Encrypted JSON Web Tokens (JWT) for authenticated clinician and patient sessions.",
      "UI localization preferences (e.g., English, Hindi, Odia).",
      "User cookie consent preference tokens."
    ],
    s4Title: "4. Patient Rights & Data Erasure",
    s4Desc: "Under applicable healthcare and digital privacy regulations, patients and screening centers retain the right to request a full transcript of screening records, contest automated triage classifications, or request complete purging of case history from our tele-ophthalmology database.",
    contactTitle: "Contact Data Protection Office",
    contactDesc: "For queries concerning clinical data security or rights requests, contact the SERIX Healthcare Compliance Team at"
  },
  hi: {
    backBtn: "स्क्रीनिंग पोर्टल पर वापस जाएं",
    kicker: "क्लिनिकल डेटा गवर्नेंस एवं गोपनीयता",
    title: "गोपनीयता नीति एवं डेटा सुरक्षा",
    effectiveDate: "प्रभावी तिथि: सितंबर 2026 | IEC 62304, HIPAA सुरक्षा नियम, और गुड मशीन लर्निंग प्रैक्टिस (GMLP) के अनुरूप।",
    s1Title: "1. हमारे द्वारा एकत्रित जानकारी",
    s1Intro: "SERIX एआई-सक्षम रेटिना स्क्रीनिंग और टेली-नेत्र विज्ञान ट्राइएज के लिए आवश्यक जानकारी एकत्र करता है:",
    s1Items: [
      { label: "रेटिना फंडस फोटोग्राफी", desc: "प्राथमिक स्वास्थ्य केंद्रों (PHC) या जांच शिविरों से अपलोड की गई उच्च-रिज़ॉल्यूशन छवियां।" },
      { label: "पहचान-रहित क्लिनिकल डेटा", desc: "आयु, मधुमेह की अवधि, HbA1c स्तर और छवि गुणवत्ता मेट्रिक्स।" },
      { label: "खाता क्रेडेंशियल", desc: "सुरक्षित पोर्टल पहुंच के लिए नाम, ईमेल और भूमिका प्राधिकरण (PHC कार्यकर्ता, नेत्र विशेषज्ञ, या मरीज़)।" }
    ],
    s2Title: "2. शून्य-प्रतिधारण अनुमान और अनामीकरण",
    s2Desc: "हमारे डीप लर्निंग मॉडल (CLAHE संवर्द्धन, घाव पहचान, और Grad-CAM दृश्यीकरण) के माध्यम से छवि प्रसंस्करण मेमोरी में निष्पादित होता है। रेटिना स्कैन SHA-256 कूटनामों का उपयोग करके एन्क्रिप्टेड रिपॉजिटरी में संग्रहीत किए जाते हैं ताकि गोपनीयता बनी रहे।",
    s3Title: "3. डेटा स्टोरेज और लोकल स्टोरेज उपयोग",
    s3Intro: "SERIX केवल आवश्यक एप्लिकेशन कार्यों के लिए आधुनिक ब्राउज़र वेब स्टोरेज (`localStorage`) का उपयोग करता है:",
    s3Items: [
      "प्रमाणित डॉक्टर और मरीज़ सत्रों के लिए एन्क्रिप्टेड JSON वेब टोकन (JWT)।",
      "भाषा प्राथमिकताएं (अंग्रेजी, हिंदी, उड़िया)।",
      "उपयोगकर्ता सहमति टोकन।"
    ],
    s4Title: "4. मरीज़ अधिकार और डेटा विलोपन",
    s4Desc: "स्वास्थ्य नियमों के तहत, मरीजों और केंद्रों को स्क्रीनिंग रिकॉर्ड की प्रतिलिपि प्राप्त करने, स्वचालित वर्गीकरण की समीक्षा मांगने या डेटा हटाने का पूरा अधिकार है।",
    contactTitle: "डेटा सुरक्षा कार्यालय से संपर्क करें",
    contactDesc: "क्लिनिकल डेटा सुरक्षा या अधिकारों से संबंधित प्रश्नों के लिए, SERIX टीम से संपर्क करें:"
  },
  or: {
    backBtn: "ସ୍କ୍ରିନିଂ ପୋର୍ଟାଲକୁ ଫେରନ୍ତୁ",
    kicker: "କ୍ଲିନିକାଲ୍ ଡାଟା ପରିଚାଳନା ଏବଂ ଗୋପନୀୟତା",
    title: "ଗୋପନୀୟତା ନୀତି ଏବଂ ଡାଟା ସୁରକ୍ଷା",
    effectiveDate: "କାର୍ଯ୍ୟକାରୀ ତାରିଖ: ସେପ୍ଟେମ୍ବର ୨୦୨୬ | IEC 62304, HIPAA ସୁରକ୍ଷା ନିୟମ ଏବଂ GMLP ମାନଦଣ୍ଡ ଅନୁଯାୟୀ।",
    s1Title: "୧. ଆମେ ସଂଗ୍ରହ କରୁଥିବା ସୂଚନା",
    s1Intro: "SERIX ଏଆଇ-ସହାୟକ ରେଟିନା ସ୍କ୍ରିନିଂ ଏବଂ ଟେଲି-ଟ୍ରାଇଏଜ୍ ପାଇଁ ଆବଶ୍ୟକୀୟ ତଥ୍ୟ ସଂଗ୍ରହ କରେ:",
    s1Items: [
      { label: "ରେଟିନା ଫଣ୍ଡସ୍ ଫଟୋଗ୍ରାଫି", desc: "ପ୍ରାଥମିକ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର (PHC) ରୁ ଅପଲୋଡ୍ ହୋଇଥିବା ରେଟିନାର ଉଚ୍ଚ-ଗୁଣବତ୍ତା ଫଟୋ।" },
      { label: "ଚିହ୍ନଟ-ମୁକ୍ତ କ୍ଲିନିକାଲ୍ ତଥ୍ୟ", desc: "ବୟସ, ଡାଇବେଟିସ୍ ଅବଧି, ଏବଂ ଫଟୋ ଗୁଣବତ୍ତା ସ୍କୋର।" },
      { label: "ଆକାଉଣ୍ଟ୍ ପରିଚୟ", desc: "ସୁରକ୍ଷିତ ଲଗଇନ୍ ପାଇଁ ନାମ, ଇମେଲ୍ ଏବଂ ଭୂମିକା (PHC କର୍ମୀ, ଡାକ୍ତର କିମ୍ବା ରୋଗୀ)।" }
    ],
    s2Title: "୨. ଶୂନ୍ୟ-ସଂରକ୍ଷଣ ଏବଂ ଅଜ୍ଞାତତା",
    s2Desc: "ଏଆଇ ମଡେଲ୍ ମାଧ୍ୟମରେ ଫଟୋ ପ୍ରକ୍ରିୟାକରଣ କେବଳ ମେମୋରୀରେ ହୋଇଥାଏ। ରେଟିନା ସ୍କାନଗୁଡ଼ିକ SHA-256 ଏନକ୍ରିପ୍ସନ୍ ସହିତ ସୁରକ୍ଷିତ ରଖାଯାଏ ଯାହାଦ୍ୱାରା ବ୍ୟକ୍ତିଗତ ପରିଚୟ ସମ୍ପୂର୍ଣ୍ଣ ଗୋପନୀୟ ରହେ।",
    s3Title: "୩. ଡାଟା ଷ୍ଟୋରେଜ୍ ଏବଂ ଲୋକାଲ୍ ଷ୍ଟୋରେଜ୍ ବ୍ୟବହାର",
    s3Intro: "SERIX କେବଳ ଜରୁରୀ କାର୍ଯ୍ୟ ପାଇଁ ବ୍ରାଉଜର୍ ଲୋକାଲ୍ ଷ୍ଟୋରେଜ୍ ବ୍ୟବହାର କରେ:",
    s3Items: [
      "ଡାକ୍ତର ଏବଂ ରୋଗୀଙ୍କ ସୁରକ୍ଷିତ ଲଗଇନ୍ ସେସନ୍ ପାଇଁ JWT ଟୋକନ୍।",
      "ଭାଷା ପସନ୍ଦ (ଇଂରାଜୀ, ହିନ୍ଦୀ, ଓଡ଼ିଆ)।",
      "ବ୍ୟବହାରକାରୀ ସମ୍ମତି ଟୋକନ୍।"
    ],
    s4Title: "୪. ରୋଗୀ ଅଧିକାର ଏବଂ ତଥ୍ୟ ବିଲୋପ",
    s4Desc: "ସ୍ୱାସ୍ଥ୍ୟସେବା ନିୟମ ଅନୁସାରେ, ରୋଗୀ ନିଜର ସ୍କ୍ରିନିଂ ରେକର୍ଡ ଦେଖିବା, ପୁନର୍ବାର ଯାଞ୍ଚ କରିବା କିମ୍ବା ତଥ୍ୟ ସମ୍ପୂର୍ଣ୍ଣ ହଟାଇବାକୁ ଅନୁରୋଧ କରିପାରିବେ।",
    contactTitle: "ଡାଟା ସୁରକ୍ଷା ଅଫିସ୍ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ",
    contactDesc: "କ୍ଲିନିକାଲ୍ ଡାଟା ସୁରକ୍ଷା ସମ୍ବନ୍ଧୀୟ ପ୍ରଶ୍ନ ପାଇଁ SERIX ଦଳ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ:"
  }
};

export default function PrivacyPolicy() {
  const { language } = useLanguageStore();
  const c = privacyContent[language] || privacyContent.en;

  usePageMeta({
    title: `${c.title} | SERIX AI Retinal Screening`,
    description: "Read about how SERIX safeguards retinal imaging data, patient confidentiality, and adheres to medical data protection standards."
  });

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#F8FAFC",
      color: "#334155",
      padding: "40px 20px 80px"
    }}>
      <div style={{
        maxWidth: "880px",
        margin: "0 auto"
      }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "28px" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#1976D2",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "#EFF6FF",
              transition: "background-color 0.15s ease"
            }}
          >
            <ArrowLeft size={16} /> {c.backBtn}
          </Link>
        </div>

        {/* Header Hero */}
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          padding: "36px 32px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
          marginBottom: "32px"
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 12px",
            borderRadius: "20px",
            backgroundColor: "#EFF6FF",
            color: "#1976D2",
            fontSize: "0.825rem",
            fontWeight: 700,
            marginBottom: "16px"
          }}>
            <Shield size={15} /> {c.kicker}
          </div>
          <h1 style={{
            fontSize: "2.25rem",
            fontWeight: 800,
            color: "#0F172A",
            lineHeight: 1.25,
            marginBottom: "12px",
            letterSpacing: "-0.02em"
          }}>
            {c.title}
          </h1>
          <p style={{
            fontSize: "1rem",
            color: "#64748B",
            lineHeight: 1.6,
            margin: 0
          }}>
            {c.effectiveDate}
          </p>
        </div>

        {/* Content Body */}
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          padding: "36px 32px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
          display: "flex",
          flexDirection: "column",
          gap: "36px"
        }}>
          {/* Section 1 */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                backgroundColor: "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Eye size={18} color="#0284C7" />
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                {c.s1Title}
              </h2>
            </div>
            <p style={{ lineHeight: 1.7, color: "#475569", margin: "0 0 12px" }}>
              {c.s1Intro}
            </p>
            <ul style={{ paddingLeft: "24px", lineHeight: 1.7, color: "#475569", margin: 0 }}>
              {c.s1Items.map((item, idx) => (
                <li key={idx}><strong>{item.label}:</strong> {item.desc}</li>
              ))}
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                backgroundColor: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Lock size={18} color="#059669" />
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                {c.s2Title}
              </h2>
            </div>
            <p style={{ lineHeight: 1.7, color: "#475569", margin: 0 }}>
              {c.s2Desc}
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                backgroundColor: "#FDF2F8", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Database size={18} color="#DB2777" />
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                {c.s3Title}
              </h2>
            </div>
            <p style={{ lineHeight: 1.7, color: "#475569", margin: "0 0 12px" }}>
              {c.s3Intro}
            </p>
            <ul style={{ paddingLeft: "24px", lineHeight: 1.7, color: "#475569", margin: 0 }}>
              {c.s3Items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <CheckCircle2 size={18} color="#D97706" />
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                {c.s4Title}
              </h2>
            </div>
            <p style={{ lineHeight: 1.7, color: "#475569", margin: 0 }}>
              {c.s4Desc}
            </p>
          </section>

          {/* Section 5 */}
          <section style={{
            padding: "20px",
            backgroundColor: "#F8FAFC",
            borderRadius: "12px",
            border: "1px solid #E2E8F0"
          }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", margin: "0 0 8px" }}>
              {c.contactTitle}
            </h3>
            <p style={{ lineHeight: 1.6, color: "#64748B", margin: 0, fontSize: "0.925rem" }}>
              {c.contactDesc} <strong style={{ color: "#1976D2" }}>privacy@serixhealth.org</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
