import { useNavigate } from "react-router-dom";
import { User, Stethoscope } from "lucide-react";

export default function RoleSelector() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
      <h1 style={{ marginBottom: '16px', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Welcome to SERIX</h1>
      <p style={{ marginBottom: '48px', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>Select your role to continue to the portal</p>
      
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* PHC Worker Button */}
        <button 
          onClick={() => navigate('/phc')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
            padding: '48px 32px', borderRadius: '24px', border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '280px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 82, 255, 0.15)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; }}
        >
          <div style={{ padding: '24px', borderRadius: '50%', backgroundColor: 'rgba(0, 82, 255, 0.1)', color: 'var(--color-primary)' }}>
            <User size={56} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>PHC Worker</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>Upload images and manage patient cases locally.</p>
        </button>

        {/* Doctor Button */}
        <button 
          onClick={() => navigate('/doctor')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
            padding: '48px 32px', borderRadius: '24px', border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '280px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(34, 197, 94, 0.15)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; }}
        >
          <div style={{ padding: '24px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            <Stethoscope size={56} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Ophthalmologist</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>Review cases, view AI insights, and schedule.</p>
        </button>
      </div>
    </div>
  );
}
