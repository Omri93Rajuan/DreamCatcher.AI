import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const setUser = useAuthStore((s) => s.setUser);

  const onSubmit = async (data: FormData) => {
    await AuthApi.login(data);
    const verify = await AuthApi.verify();
    if (verify?.user) setUser(verify.user);
    window.location.href = "/";
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="glass-card p-8 rounded-2xl w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">התחברות</h1>
        <div className="space-y-4">
          <div>
            <Input type="email" placeholder="אימייל" {...register("email")} />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Input
              type="password"
              placeholder="סיסמה"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            כניסה
          </Button>
        </div>
      </form>
    </div>
  );
}
