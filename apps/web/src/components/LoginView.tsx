import React, { useEffect, useState } from "react";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  LogIn, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck,
  User,
  ShieldAlert,
  Compass
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { workspaceApi } from "../services/workspaceApi";
import AuthService from "../services/auth";

interface LoginViewProps {
  setActiveView: (view: any) => void;
  triggerToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export function LoginView({ setActiveView, triggerToast }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register" | "reset">("login");
  const [resetToken, setResetToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const current = AuthService.getCurrentUser();
    if (current?.email) setUserEmail(current.email);
    else setEmail(window.localStorage.getItem("brick-maker-last-email") ?? "");
    const params = new URLSearchParams(window.location.search);
    const reset = params.get('reset_token');
    const verify = params.get('verify_token');
    if (reset) { setResetToken(reset); setAuthMode('reset'); }
    if (verify) {
      void AuthService.verifyEmail(verify).then(result => {
        triggerToast(result.success ? 'Email verify ho gaya. Ab login karein.' : (result.error?.message ?? 'Verification failed.'), result.success ? 'success' : 'error');
      });
    }
  }, []);

  const onSuccess = (nextEmail: string, _nextRole?: "Admin" | "User" | "Staff") => {
    setUserEmail(nextEmail);
  };

  const onLogout = () => {
    void AuthService.logout();
    setUserEmail("");
    setEmail("");
    setPassword("");
    triggerToast("Session disconnected.", "info");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if ((authMode !== 'reset' && !email) || !password) {
      setErrorMsg("All fields are required.");
      triggerToast("Please enter email and password.", "error");
      return;
    }

    setIsLoading(true);

    if ((authMode === 'reset' || email.includes("@")) && password.length >= 10) {
      const result = authMode === "register"
        ? await AuthService.register(email, password)
        : authMode === 'reset'
          ? await AuthService.resetPassword(resetToken, password)
          : await AuthService.login(email, password);
      if (result.success) {
        if (authMode === 'reset') {
          setAuthMode('login'); setResetToken(''); setPassword('');
          window.history.replaceState({}, '', '/login');
          triggerToast('Password update ho gaya. Ab login karein.', 'success');
          setIsLoading(false);
          return;
        }
        if (rememberMe) window.localStorage.setItem("brick-maker-last-email", email);
        void workspaceApi.action("login", authMode === "register" ? "account-created" : "session-created", { email });
        onSuccess(email);
        triggerToast(authMode === "register" ? "Account successfully create ho gaya." : "Secure login successful.", "success");
        setActiveView("dashboard");
      } else {
        const message = result.error?.message ?? "Authentication failed.";
        setErrorMsg(message);
        triggerToast(message, "error");
      }
    } else {
      setErrorMsg("Valid email aur minimum 10-character password required hai.");
      triggerToast("Password minimum 10 characters ka rakhein.", "error");
    }
    setIsLoading(false);
  };

  return (
    <div id="login-view" className="workspace-page relative min-h-[80vh] flex items-center justify-center py-10 px-4 overflow-hidden select-none">
      
      {/* LUXURIOUS BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle glowing radial background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#F8B400]/5 to-transparent blur-[120px] rounded-full" />
        
        {/* Animated golden light strips */}
        <div className="absolute top-10 left-10 w-24 h-24 border-t border-l border-amber-500/20 rounded-tl-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-24 h-24 border-b border-r border-amber-500/20 rounded-br-3xl animate-pulse" />
      </div>

      <div className="w-full max-w-xl space-y-8 relative z-10">
        
        {/* BRICK-MAKER STUDIO BRAND HEADER */}
        <div className="text-center space-y-3 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0e0e0e] to-black border border-amber-500/30 shadow-xl mb-1 text-amber-400">
            <Compass size={22} className="animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white tracking-widest">BRICK-MAKER STUDIO</h2>
            <p className="text-[10px] uppercase font-bold text-[#F8B400] tracking-[0.25em]">All-in-One Creative Business Platform</p>
            <p className="text-[9px] text-gray-500 font-mono">Design • Create • Promote • Grow</p>
          </div>
        </div>

        {userEmail ? (
          /* ALREADY LOGGED IN VIEW */
          <div className="p-8 rounded-2xl border border-amber-500/20 bg-[#09090b] shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F8B400] mx-auto animate-pulse">
              <UserCheck size={28} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Local Session Found</h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
                This browser has a local workspace session for <span className="text-[#F8B400] font-bold font-mono">{userEmail}</span>. Open it or switch the local account.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => setActiveView("dashboard")}
                className="px-5 py-2.5 rounded-xl bg-[#F8B400] hover:bg-amber-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Go to Workspace <ArrowLeft size={13} className="rotate-180" />
              </button>
              <button
                onClick={onLogout}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-gray-400 font-extrabold text-xs transition-all border border-white/5 cursor-pointer"
              >
                Disconnect Session
              </button>
            </div>
          </div>
        ) : (
          /* STANDALONE LOGIN FORM CARD */
          <div className="p-8 rounded-[18px] border border-amber-500/20 bg-[#09090b]/90 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Ambient gold glow card accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full pointer-events-none" />

            <div className="mb-6 space-y-1.5 text-center sm:text-left">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2 justify-center sm:justify-start">
                <LogIn size={18} className="text-[#F8B400]" />
                Welcome Back
              </h3>
              <p className="text-xs text-gray-400">
                Login to continue managing your creative business workspace.
              </p>
            </div>

            {/* Secure login / account creation */}
            <div className="mb-6">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center sm:text-left">
                Secure account access
              </span>
              <div className="grid grid-cols-2 gap-2">
                {([['login', 'Login'], ['register', 'Create Account']] as const).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setAuthMode(mode); setErrorMsg(''); }}
                    className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      authMode === mode
                        ? "border-[#F8B400] bg-[#F8B400]/10 text-[#F8B400] shadow-[0_0_10px_rgba(248,180,0,0.1)]" 
                        : "border-white/5 bg-[#0d0d0d] text-gray-400 hover:text-white hover:border-white/15"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-fade-in">
                  <AlertTriangle size={13} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* User ID / Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="architect@brickmaker.com"
                    className="w-full pl-10 pr-4 rounded-xl bg-black border border-white/10 focus:border-amber-500/60 text-white text-xs outline-none transition-all placeholder:text-gray-700"
                    style={{ height: "48px" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email.includes('@')) {
                        triggerToast('Reset ke liye valid email enter karein.', 'warning');
                        return;
                      }
                      const result = await AuthService.requestPasswordReset(email);
                      triggerToast(result.data?.message ?? result.error?.message ?? 'Reset request process ho gayi.', result.success ? 'success' : 'error');
                    }}
                    className="text-[10px] text-amber-500 font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 rounded-xl bg-black border border-white/10 focus:border-amber-500/60 text-white text-xs outline-none transition-all placeholder:text-gray-700"
                    style={{ height: "48px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-[#F8B400] cursor-pointer"
                  />
                  <span>Keep session synchronized</span>
                </label>
                <span className="text-[10px] text-gray-600 font-mono">Stored in this browser</span>
              </div>

              {/* Submit Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  style={{ height: "48px" }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>{authMode === 'register' ? 'Creating Account...' : authMode === 'reset' ? 'Updating Password...' : 'Signing In...'}</span>
                    </div>
                  ) : (
                    <>
                      <LogIn size={14} />
                      <span>{authMode === 'register' ? 'Create Secure Account' : authMode === 'reset' ? 'Set New Password' : 'Sign In'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

            <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-gray-500">
              <button
                onClick={() => setActiveView("dashboard")}
                className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={12} /> Back to main dashboard
              </button>
              <span className="font-mono text-[10px] text-gray-700">Brick-Maker Secure Workspace</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
