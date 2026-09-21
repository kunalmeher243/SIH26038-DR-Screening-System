import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Stethoscope, Heart, Lock, Mail, User as UserIcon } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import Toast from "../components/common/Toast";
import useToastStore from "../store/useToastStore";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Patient");
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const signup = useAuthStore(state => state.signup);
  const showToast = useToastStore(state => state.showToast);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const user = await login({ email, password, role });
        showToast(`Welcome back, ${user.name}`, "success");
        navigate(`/${user.portal}`);
      } else {
        if (!name) throw new Error("Name is required");
        const user = await signup({ name, email, password, role });
        showToast(`Account created successfully`, "success");
        navigate(`/${user.portal}`);
      }
    } catch (err) {
      showToast(err.userMessage || err.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid var(--saas-border)' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '2rem', fontWeight: 800, color: 'var(--saas-fg)', textAlign: 'center' }}>
          {isLogin ? "Welcome back" : "Create an account"}
        </h1>
        <p style={{ marginBottom: '32px', color: 'var(--saas-fg-muted)', textAlign: 'center' }}>
          {isLogin ? "Enter your details to access your portal" : "Sign up to get started"}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid var(--saas-border)', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid var(--saas-border)', fontSize: '1rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid var(--saas-border)', fontSize: '1rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 600 }}>I am a...</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button 
                type="button"
                onClick={() => setRole("Patient")}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 8px', borderRadius: '12px', border: `2px solid ${role === 'Patient' ? 'var(--saas-accent)' : 'var(--saas-border)'}`, backgroundColor: role === 'Patient' ? 'rgba(0,82,255,0.05)' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Heart size={24} color={role === 'Patient' ? 'var(--saas-accent)' : '#9ca3af'} />
                <span style={{ fontSize: '0.8rem', fontWeight: role === 'Patient' ? 700 : 500, color: role === 'Patient' ? 'var(--saas-accent)' : 'var(--saas-fg-muted)' }}>Patient</span>
              </button>
              
              <button 
                type="button"
                onClick={() => setRole("PHC Worker")}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 8px', borderRadius: '12px', border: `2px solid ${role === 'PHC Worker' ? 'var(--saas-accent)' : 'var(--saas-border)'}`, backgroundColor: role === 'PHC Worker' ? 'rgba(0,82,255,0.05)' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <User size={24} color={role === 'PHC Worker' ? 'var(--saas-accent)' : '#9ca3af'} />
                <span style={{ fontSize: '0.8rem', fontWeight: role === 'PHC Worker' ? 700 : 500, color: role === 'PHC Worker' ? 'var(--saas-accent)' : 'var(--saas-fg-muted)' }}>PHC Worker</span>
              </button>

              <button 
                type="button"
                onClick={() => setRole("Ophthalmologist")}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 8px', borderRadius: '12px', border: `2px solid ${role === 'Ophthalmologist' ? '#22c55e' : 'var(--saas-border)'}`, backgroundColor: role === 'Ophthalmologist' ? 'rgba(34,197,94,0.05)' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Stethoscope size={24} color={role === 'Ophthalmologist' ? '#22c55e' : '#9ca3af'} />
                <span style={{ fontSize: '0.8rem', fontWeight: role === 'Ophthalmologist' ? 700 : 500, color: role === 'Ophthalmologist' ? '#22c55e' : 'var(--saas-fg-muted)' }}>Doctor</span>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '12px', width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--saas-accent)', color: '#fff', fontSize: '1rem', fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--saas-fg-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ background: 'none', border: 'none', color: 'var(--saas-accent)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
