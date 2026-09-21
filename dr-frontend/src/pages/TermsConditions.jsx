import { AlertTriangle, ArrowLeft, ShieldCheck, Scale, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import usePageMeta from "../utils/usePageMeta";
import useLanguageStore from "../store/useLanguageStore";

const termsContent = {
  en: {
    backBtn: "Back to Screening Portal",
    kicker: "CLINICAL TERMS & OPERATIONAL PROTOCOLS",
    title: "Terms & Conditions of Use",
    lastUpdated: "Last Updated: September 2026 | Governing deployment of the SERIX AI Screening & Tele-Ophthalmology System.",
    disclaimerHeading: "MANDATORY CLINICAL & MEDICAL DISCLAIMER",
    disclaimerText: "This platform is an AI-assisted screening tool, not a certified clinical diagnosis. Automated DR classifications (No DR, Mild, Moderate, Severe, Proliferative DR) and Grad-CAM visual heatmaps are decision-support aids designed for triage in primary health centers. All findings must be reviewed and confirmed by a certified ophthalmologist or medical professional before clinical treatment or surgical intervention.",
    s1Title: "1. Scope of Service & Clinical Workflow",
    s1Intro: "SERIX provides software workflows connecting field health workers (PHC workers), ophthalmologists, and patients:",
    s1Items: [
      { label: "Image Quality Assessment (IQA)", desc: "Evaluates illumination, sharpness, and macular field visibility." },
      { label: "Tele-Ophthalmology Triage", desc: "Generates case tickets for remote specialist consultation and appointment scheduling." },
      { label: "Patient Reports", desc: "Multilingual summary generation for referral follow-up." }
    ],
    s2Title: "2. User Obligations & Appropriate Use",
    s2Desc: "Users must ensure all uploaded fundus photography is obtained with proper patient consent. PHC workers and clinicians agree not to reverse engineer the AI inference models or circumvent security safeguards.",
    s3Title: "3. Limitation of Liability",
    s3Desc: "To the maximum extent permitted under applicable law, SERIX and its developers are not liable for clinical outcomes, treatment choices, or missed diagnoses resulting from degraded image quality, non-standard camera optics, or delay in specialist follow-up.",
    emergencyTitle: "Emergency Medical Notice",
    emergencyDesc: "SERIX is not designed for acute retinal detachment or ophthalmic trauma emergencies. In case of sudden loss of vision, immediate emergency care must be sought at the nearest hospital."
  },
  hi: {
    backBtn: "स्क्रीनिंग पोर्टल पर वापस जाएं",
    kicker: "क्लिनिकल शर्तें एवं संचालन प्रोटोकॉल",
    title: "नियम एवं शर्तें (उपयोग की शर्तें)",
    lastUpdated: "अंतिम अद्यतन: सितंबर 2026 | SERIX एआई स्क्रीनिंग एवं टेली-नेत्र विज्ञान प्रणाली का संचालन।",
    disclaimerHeading: "अनिवार्य क्लिनिकल एवं चिकित्सा अस्वीकरण",
    disclaimerText: "यह प्लेटफ़ॉर्म एक एआई-सहायक स्क्रीनिंग उपकरण है, अंतिम नैदानिक निदान (Certified Clinical Diagnosis) नहीं। स्वचालित DR वर्गीकरण (No DR, Mild, Moderate, Severe, Proliferative DR) और Grad-CAM हीटमैप केवल प्राथमिक स्वास्थ्य केंद्रों में ट्राइएज के लिए निर्णय-सहायक हैं। किसी भी नैदानिक उपचार या शल्य चिकित्सा से पहले सभी निष्कर्षों की प्रमाणित नेत्र रोग विशेषज्ञ द्वारा समीक्षा और पुष्टि अनिवार्य है।",
    s1Title: "1. सेवा का दायरा एवं क्लिनिकल कार्यप्रवाह",
    s1Intro: "SERIX स्वास्थ्य कार्यकर्ताओं (PHC), नेत्र रोग विशेषज्ञों और मरीजों को जोड़ने वाली प्रणाली प्रदान करता है:",
    s1Items: [
      { label: "छवि गुणवत्ता मूल्यांकन (IQA)", desc: "प्रकाश, तीक्ष्णता और रेटिना दृश्यता की जांच करता है।" },
      { label: "टेली-नेत्र विज्ञान ट्राइएज", desc: "रिमोट विशेषज्ञ परामर्श के लिए केस टिकट बनाता है।" },
      { label: "मरीज़ रिपोर्ट", desc: "रेफरल और फॉलो-अप के लिए बहुभाषी रिपोर्ट तैयार करता है।" }
    ],
    s2Title: "2. उपयोगकर्ता के दायित्व एवं उचित उपयोग",
    s2Desc: "उपयोगकर्ताओं को यह सुनिश्चित करना होगा कि अपलोड की गई सभी रेटिना छवियां उचित मरीज़ सहमति के साथ प्राप्त की गई हैं। उपयोगकर्ता एआई मॉडल में किसी भी प्रकार के अनधिकृत बदलाव या सुरक्षा से छेड़छाड़ न करने के लिए सहमत हैं।",
    s3Title: "3. देयता की सीमा",
    s3Desc: "लागू कानून के तहत, खराब छवि गुणवत्ता, गैर-मानक कैमरा या विशेषज्ञ फॉलो-अप में देरी के कारण होने वाले किसी भी क्लिनिकल परिणाम के लिए SERIX उत्तरदायी नहीं होगा।",
    emergencyTitle: "आपातकालीन चिकित्सा सूचना",
    emergencyDesc: "SERIX तीव्र रेटिनल डिटैचमेंट या गंभीर आंख की चोट के लिए नहीं है। दृष्टि के अचानक चले जाने की स्थिति में, तुरंत नजदीकी अस्पताल में आपातकालीन देखभाल प्राप्त करें।"
  },
  or: {
    backBtn: "ସ୍କ୍ରିନିଂ ପୋର୍ଟାଲକୁ ଫେରନ୍ତୁ",
    kicker: "କ୍ଲିନିକାଲ୍ ସର୍ତ୍ତାବଳୀ ଏବଂ ପରିଚାଳନା ନିୟମ",
    title: "ନିୟମ ଏବଂ ସର୍ତ୍ତାବଳୀ",
    lastUpdated: "ଶେଷ ଅଦ୍ୟତନ: ସେପ୍ଟେମ୍ବର ୨୦୨୬ | SERIX ଏଆଇ ସ୍କ୍ରିନିଂ ଏବଂ ଟେଲି-ନେତ୍ର ଚିକିତ୍ସା ପ୍ରଣାଳୀ।",
    disclaimerHeading: "ବାଧ୍ୟତାମୂଳକ କ୍ଲିନିକାଲ୍ ଏବଂ ଚିକିତ୍ସା ଦାୟିତ୍ୱହୀନତା",
    disclaimerText: "ଏହି ପ୍ଲାଟଫର୍ମଟି ଏକ ଏଆଇ-ସହାୟକ ସ୍କ୍ରିନିଂ ଉପକରଣ, କୌଣସି ଚୂଡ଼ାନ୍ତ ଡାକ୍ତରୀ ନିଦାନ (Diagnosis) ନୁହେଁ। ସ୍ୱୟଂଚାଳିତ DR ବର୍ଗୀକରଣ ଏବଂ Grad-CAM ହିଟମ୍ୟାପ୍ କେବଳ ପ୍ରାଥମିକ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ରରେ ଟ୍ରାଇଏଜ୍ ପାଇଁ ନିଷ୍ପତ୍ତି-ସହାୟକ। ଯେକୌଣସି ଚିକିତ୍ସା କିମ୍ବା ଅସ୍ତ୍ରୋପଚାର ପୂର୍ବରୁ ଜଣେ ଯୋଗ୍ୟ ଚକ୍ଷୁ ବିଶେଷଜ୍ଞଙ୍କ ଦ୍ୱାରା ଯାଞ୍ଚ ଏବଂ ଅନୁମୋଦନ ବାଧ୍ୟତାମୂଳକ।",
    s1Title: "୧. ସେବାର ପରିସର ଏବଂ କାର୍ଯ୍ୟପ୍ରଣାଳୀ",
    s1Intro: "SERIX ସ୍ୱାସ୍ଥ୍ୟକର୍ମୀ (PHC), ଚକ୍ଷୁ ବିଶେଷଜ୍ଞ ଏବଂ ରୋଗୀଙ୍କୁ ସଂଯୋଗ କରେ:",
    s1Items: [
      { label: "ଫଟୋ ଗୁଣବତ୍ତା ଯାଞ୍ଚ (IQA)", desc: "ଆଲୋକ, ସ୍ପଷ୍ଟତା ଏବଂ ମାକୁଲାର୍ ଅଞ୍ଚଳର ଯାଞ୍ଚ କରେ।" },
      { label: "ଟେଲି-ଟ୍ରାଇଏଜ୍", desc: "ଦୂରବର୍ତ୍ତୀ ବିଶେଷଜ୍ଞ ପରାମର୍ଶ ପାଇଁ କେସ୍ ଟିକେଟ୍ ସୃଷ୍ଟି କରେ।" },
      { label: "ରୋଗୀ ରିପୋର୍ଟ", desc: "ରେଫରାଲ୍ ଏବଂ ଫଲୋ-ଅପ୍ ପାଇଁ ବହୁଭାଷୀ ରିପୋର୍ଟ ପ୍ରଦାନ କରେ।" }
    ],
    s2Title: "୨. ବ୍ୟବହାରକାରୀଙ୍କ ଦାୟିତ୍ୱ",
    s2Desc: "ସମସ୍ତ ରେଟିନା ଫଟୋ ରୋଗୀଙ୍କ ଉପଯୁକ୍ତ ସମ୍ମତି ସହିତ ଅପଲୋଡ୍ ହେବା ଆବଶ୍ୟକ। ବ୍ୟବହାରକାରୀମାନେ ଏଆଇ ସିଷ୍ଟମରେ କୌଣସି ପ୍ରକାରର ଅନଧିକୃତ ପରିବର୍ତ୍ତନ ନକରିବାକୁ ସହମତ।",
    s3Title: "୩. ଦାୟିତ୍ୱର ସୀମା",
    s3Desc: "ଖରାପ ଫଟୋ ଗୁଣବତ୍ତା, ଅଣ-ମାନକ କ୍ୟାମେରା କିମ୍ବା ବିଶେଷଜ୍ଞ ଯାଞ୍ଚରେ ବିଳମ୍ବ ଯୋଗୁଁ ହେଉଥିବା କୌଣସି କ୍ଷତି ପାଇଁ SERIX ଦାୟୀ ରହିବ ନାହିଁ।",
    emergencyTitle: "ଜରୁରୀକାଳୀନ ଚିକିତ୍ସା ସୂଚନା",
    emergencyDesc: "SERIX ଜରୁରୀକାଳୀନ ଚକ୍ଷୁ ଆଘାତ ପାଇଁ ଉଦ୍ଦିଷ୍ଟ ନୁହେଁ। ହଠାତ୍ ଦୃଷ୍ଟିଶକ୍ତି ହ୍ରାସ ପାଇଲେ ତୁରନ୍ତ ନିକଟସ୍ଥ ଡାକ୍ତରଖାନାରେ ଜରୁରୀକାଳୀନ ଚିକିତ୍ସା ନିଅନ୍ତୁ।"
  }
};

export default function TermsConditions() {
  const { language } = useLanguageStore();
  const c = termsContent[language] || termsContent.en;

  usePageMeta({
    title: `${c.title} | SERIX AI Retinal Screening`,
    description: "Read terms of use and clinical disclaimers for the SERIX Diabetic Retinopathy screening and tele-ophthalmology system."
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
          marginBottom: "28px"
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
            <Scale size={15} /> {c.kicker}
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
            {c.lastUpdated}
          </p>
        </div>

        {/* MANDATORY MEDICAL DISCLAIMER BANNER */}
        <div style={{
          backgroundColor: "#FFFBEB",
          border: "2px solid #F59E0B",
          borderRadius: "16px",
          padding: "24px 28px",
          marginBottom: "32px",
          display: "flex",
          gap: "18px",
          alignItems: "flex-start",
          boxShadow: "0 4px 16px rgba(245, 158, 11, 0.08)"
        }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0
          }}>
            <AlertTriangle size={24} color="#D97706" />
          </div>
          <div>
            <h3 style={{
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "#92400E",
              margin: "0 0 6px"
            }}>
              {c.disclaimerHeading}
            </h3>
            <p style={{
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "#78350F",
              margin: 0,
              fontWeight: 500
            }}>
              {c.disclaimerText}
            </p>
          </div>
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
                <Stethoscope size={18} color="#0284C7" />
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
                <ShieldCheck size={18} color="#059669" />
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
                backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Scale size={18} color="#D97706" />
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                {c.s3Title}
              </h2>
            </div>
            <p style={{ lineHeight: 1.7, color: "#475569", margin: 0 }}>
              {c.s3Desc}
            </p>
          </section>

          {/* Section 4 */}
          <section style={{
            padding: "20px",
            backgroundColor: "#F8FAFC",
            borderRadius: "12px",
            border: "1px solid #E2E8F0"
          }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", margin: "0 0 8px" }}>
              {c.emergencyTitle}
            </h3>
            <p style={{ lineHeight: 1.6, color: "#64748B", margin: 0, fontSize: "0.925rem" }}>
              {c.emergencyDesc}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
