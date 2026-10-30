import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"
import { useAuth } from "../../context/useAuth"

import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card"
import { Sparkles, Eye, EyeOff, Briefcase } from "lucide-react"

const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const userData = await login(data.email, data.password)
      toast.success("Login berhasil!")
      if (userData.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/app")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login gagal, silakan periksa email/password Anda")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
      {/* Ambient background glow & grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.3),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.15),transparent_50%)]" />
      
      <div className="relative w-full max-w-md my-8">
        {/* Brand header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Platform Rekomendasi Magang Berbasis AI</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">MagangConnect</h1>
          </div>
        </div>

        {/* Card Form */}
        <Card className="border border-slate-800 bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 rounded-2xl">
          <CardHeader className="space-y-1.5 text-center pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Selamat Datang</CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Masuk ke akun Anda untuk menemukan magang impian
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</label>
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  {...register("email")}
                  className={`bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 ${
                    errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                  >
                    Lupa sandi?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={`bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 pr-10 focus:border-blue-500 ${
                      errors.password ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                id="btn-login-submit"
                className="w-full font-semibold shadow-lg shadow-blue-600/30 bg-blue-600 hover:bg-blue-500 text-white h-10 transition-all hover:scale-[1.01] active:scale-[0.99]"
                disabled={isLoading}
              >
                {isLoading ? "Memproses..." : "Masuk ke Akun"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            Belum punya akun?{" "}
            <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 hover:underline ml-1">
              Daftar Sekarang
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
