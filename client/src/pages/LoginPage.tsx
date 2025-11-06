import LoginForm from "@/components/auth/LoginForm";
import { Link } from "react-router-dom";
export default function LoginPage() {
    return (<div className="flex justify-center items-center min-h-[70vh] p-4">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl border border-white/20">
        <h2 className="text-center text-2xl font-bold mb-6">התחברות</h2>

        <LoginForm onSuccess={() => {
            window.location.href = "/";
        }}/>

        
        <div className="text-center mt-4">
          <Link to="/forgot-password" className="text-blue-400 hover:underline transition">
            שכחתי סיסמה
          </Link>
        </div>
      </div>
    </div>);
}
