import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"
import api from "../../api/axios"

import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card"
import { Briefcase, Eye, EyeOff, Sparkles } from "lucide-react"

const registerSchema = z.object({
  nama_lengkap: z.string().min(3, "Nama minimal 3 karakter"),
  nim: z.string().min(5, "NIM minimal 5 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  prodi_id: z.string().min(1, "Program studi wajib dipilih"),
})

export default function Register() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [studyPrograms, setStudyPrograms] = useState([])
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await api.get("/study-programs")
        setStudyPrograms(res.data.data)
      } catch (error) {
        toast.error("Gagal memuat program studi")
      }
    }
    fetchPrograms()
  }, [])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await api.post("/auth/register", {
        ...data,
        prodi_id: parseInt(data.prodi_id),
      })
      toast.success("Registrasi berhasil! Silakan login.")
      navigate("/login")
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal registrasi")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.3),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.15),transparent_50%)]" />

      <div className="relative w-full max-w-lg my-8">
        {/* Brand header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Pendaftaran Akun Mahasiswa</span>
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
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Buat Profil Mahasiswa</CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Lengkapi data akademik untuk rekomendasi magang yang akurat
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Nama Lengkap</label>
                <Input
                  placeholder="Contoh: Budi Santoso"
                  {...register("nama_lengkap")}
                  className={`bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 ${
                    errors.nama_lengkap ? "border-red-500" : ""
                  }`}
                />
                {errors.nama_lengkap && <p className="text-xs text-red-400">{errors.nama_lengkap.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">NIM</label>
                  <Input
                    placeholder="Contoh: 2100001"
                    {...register("nim")}
                    className={`bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 ${
                      errors.nim ? "border-red-500" : ""
                    }`}
                  />
                  {errors.nim && <p className="text-xs text-red-400">{errors.nim.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Program Studi</label>
                  <select
                    {...register("prodi_id")}
                    className={`flex h-10 w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white focus-visible:outline-none focus:border-blue-500 ${
                      errors.prodi_id ? "border-red-500" : ""
                    }`}
                  >
                    <option value="" className="bg-slate-900 text-slate-400">Pilih Prodi...</option>
                    {studyPrograms.map((prodi) => (
                      <option key={prodi.id} value={prodi.id} className="bg-slate-900 text-white">
                        {prodi.nama_prodi} ({prodi.jenjang})
                      </option>
                    ))}
                  </select>
                  {errors.prodi_id && <p className="text-xs text-red-400">{errors.prodi_id.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Kampus / Pribadi</label>
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  {...register("email")}
                  className={`bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    {...register("password")}
                    className={`bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 pr-10 focus:border-blue-500 ${
                      errors.password ? "border-red-500" : ""
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
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                id="btn-register-submit"
                className="w-full font-semibold shadow-lg shadow-blue-600/30 bg-blue-600 hover:bg-blue-500 text-white h-10 mt-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
                disabled={isLoading}
              >
                {isLoading ? "Memproses..." : "Daftar Akun Mahasiswa"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 hover:underline ml-1">
              Masuk ke sini
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
