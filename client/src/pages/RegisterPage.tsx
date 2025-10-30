import SignupForm from "@/components/auth/SignupForm";

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-h-[70vh] p-4">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl border border-white/20">
        <h2 className="text-center text-2xl font-bold mb-6">הרשמה</h2>

        <SignupForm
          onSuccess={() => {
            window.location.href = "/";
          }}
        />
      </div>
    </div>
  );
}
