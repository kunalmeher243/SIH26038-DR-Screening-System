import { useNavigate } from "react-router-dom";
import { User, ShieldCheck, Stethoscope } from "lucide-react";

export default function RoleSelector() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '32px 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '640px', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: 'rgba(25, 118, 210, 0.08)', color: '#1976D2', fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px' }}>
          RetinaTrack AI Portal
        </div>
        <h1 style={{ marginBottom: '12px', fontSize: '2.4rem', fontWeight: 800, color: '#263238', letterSpacing: '-0.02em' }}>
          Select Your Portal
        </h1>
        <p style={{ margin: 0, fontSize: '1.05rem', color: '#607D8B', lineHeight: 1.5 }}>
          Access clinical screenings, tele-ophthalmology triage, and patient diagnostic records.
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '960px', width: '100%' }}>
        {/* Patient Button */}
        <button 
          onClick={() => navigate('/patient')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
            padding: '36px 28px', borderRadius: '20px', border: '1px solid #D9E2E8',
            backgroundColor: '#FFFFFF', cursor: 'pointer', transition: 'all 0.25s ease',
            flex: '1 1 260px', maxWidth: '300px', boxShadow: '0 4px 16px rgba(30, 60, 90, 0.05)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#1976D2'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(25, 118, 210, 0.12)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#D9E2E8'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 60, 90, 0.05)'; }}
        >
          <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(25, 118, 210, 0.08)', color: '#1976D2' }}>
            <User size={44} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#263238', margin: 0 }}>Patient Portal</h2>
          <p style={{ fontSize: '0.875rem', color: '#607D8B', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
            Check screening records, AI assessment reports, and doctor consultations.
          </p>
          <span className="btn-outline-blue" style={{ marginTop: 'auto', width: '100%', textAlign: 'center', display: 'block', padding: '8px 0', fontSize: '0.85rem' }}>
            Access Portal →
          </span>
        </button>

        {/* PHC Worker Button */}
        <button 
          onClick={() => navigate('/phc')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
            padding: '36px 28px', borderRadius: '20px', border: '1px solid #D9E2E8',
            backgroundColor: '#FFFFFF', cursor: 'pointer', transition: 'all 0.25s ease',
            flex: '1 1 260px', maxWidth: '300px', boxShadow: '0 4px 16px rgba(30, 60, 90, 0.05)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#16A085'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(22, 160, 133, 0.12)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#D9E2E8'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 60, 90, 0.05)'; }}
        >
          <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(22, 160, 133, 0.08)', color: '#16A085' }}>
            <ShieldCheck size={44} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#263238', margin: 0 }}>PHC Worker</h2>
          <p style={{ fontSize: '0.875rem', color: '#607D8B', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
            Upload fundus photographs, perform quality checks, and dispatch tele-triage tickets.
          </p>
          <span className="btn-outline-green" style={{ marginTop: 'auto', width: '100%', textAlign: 'center', display: 'block', padding: '8px 0', fontSize: '0.85rem' }}>
            Access Portal →
          </span>
        </button>

        {/* Doctor Button */}
        <button 
          onClick={() => navigate('/doctor')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
            padding: '36px 28px', borderRadius: '20px', border: '1px solid #D9E2E8',
            backgroundColor: '#FFFFFF', cursor: 'pointer', transition: 'all 0.25s ease',
            flex: '1 1 260px', maxWidth: '300px', boxShadow: '0 4px 16px rgba(30, 60, 90, 0.05)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#1976D2'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(25, 118, 210, 0.12)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#D9E2E8'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 60, 90, 0.05)'; }}
        >
          <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(25, 118, 210, 0.08)', color: '#1976D2' }}>
            <Stethoscope size={44} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#263238', margin: 0 }}>Ophthalmologist</h2>
          <p style={{ fontSize: '0.875rem', color: '#607D8B', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
            Review high-risk cases, examine Grad-CAM heatmaps, and schedule appointments.
          </p>
          <span className="btn-outline-blue" style={{ marginTop: 'auto', width: '100%', textAlign: 'center', display: 'block', padding: '8px 0', fontSize: '0.85rem' }}>
            Access Portal →
          </span>
        </button>
      </div>
    </div>
  );
}
