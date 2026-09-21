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
      <div className="card glass-panel" style={{ width: '100%', maxWidth: '440px' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '2rem', textAlign: 'center' }}>
          {isLogin ? "Welcome back" : "Create an account"}
        </h1>
        <p style={{ marginBottom: '32px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          {isLogin ? "Enter your details to access your portal" : "Sign up to get started"}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="input-field"
                  style={{ paddingLeft: '48px' }}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                style={{ paddingLeft: '48px' }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                style={{ paddingLeft: '48px' }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">I am a...</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button 
                type="button"
                onClick={() => setRole("Patient")}
                style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 8px', 
                  borderRadius: 'var(--radius-md)', 
                  border: `2px solid ${role === 'Patient' ? 'var(--color-primary)' : 'var(--color-border)'}`, 
                  backgroundColor: role === 'Patient' ? 'var(--color-primary-light)' : 'var(--color-surface)', 
                  cursor: 'pointer', transition: 'var(--transition)' 
                }}
              >
                <Heart size={24} color={role === 'Patient' ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                <span style={{ fontSize: '0.8rem', fontWeight: role === 'Patient' ? 700 : 500, color: role === 'Patient' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>Patient</span>
              </button>
              
              <button 
                type="button"
                onClick={() => setRole("PHC Worker")}
                style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 8px', 
                  borderRadius: 'var(--radius-md)', 
                  border: `2px solid ${role === 'PHC Worker' ? 'var(--color-primary)' : 'var(--color-border)'}`, 
                  backgroundColor: role === 'PHC Worker' ? 'var(--color-primary-light)' : 'var(--color-surface)', 
                  cursor: 'pointer', transition: 'var(--transition)' 
                }}
              >
                <User size={24} color={role === 'PHC Worker' ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                <span style={{ fontSize: '0.8rem', fontWeight: role === 'PHC Worker' ? 700 : 500, color: role === 'PHC Worker' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>PHC</span>
              </button>

              <button 
                type="button"
                onClick={() => setRole("Ophthalmologist")}
                style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 8px', 
                  borderRadius: 'var(--radius-md)', 
                  border: `2px solid ${role === 'Ophthalmologist' ? 'var(--color-success)' : 'var(--color-border)'}`, 
                  backgroundColor: role === 'Ophthalmologist' ? 'var(--color-success-bg)' : 'var(--color-surface)', 
                  cursor: 'pointer', transition: 'var(--transition)' 
                }}
              >
                <Stethoscope size={24} color={role === 'Ophthalmologist' ? 'var(--color-success)' : 'var(--color-text-muted)'} />
                <span style={{ fontSize: '0.8rem', fontWeight: role === 'Ophthalmologist' ? 700 : 500, color: role === 'Ophthalmologist' ? 'var(--color-success)' : 'var(--color-text-muted)' }}>Doctor</span>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '16px' }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
