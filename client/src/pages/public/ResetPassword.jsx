import { useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"
import api from "../../api/axios"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card"

const schema = z.object({
  newPassword: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
})

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Token tidak valid.")
      return
    }
    setLoading(true)
    try {
      await api.post("/auth/reset-password", { token, newPassword: data.newPassword })
      toast.success("Password berhasil direset! Silakan login.")
      navigate("/login")
    } catch (err) {
      toast.error(err.response?.data?.message || "Token tidak valid atau sudah kedaluwarsa.")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center p-8">
          <p className="text-red-500 font-medium">Token reset tidak valid.</p>
          <Link to="/login" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
            Kembali ke Login
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-none ring-1 ring-slate-200/50">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Reset Kata Sandi
          </CardTitle>
          <CardDescription className="text-slate-500">
            Masukkan kata sandi baru Anda di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="form-reset-password">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-slate-700">
                Password Baru
              </label>
              <Input
                type="password"
                placeholder="Minimal 8 karakter"
                {...register("newPassword")}
                className={errors.newPassword ? "border-red-500" : ""}
                id="input-new-password"
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-slate-700">
                Konfirmasi Password Baru
              </label>
              <Input
                type="password"
                placeholder="Ulangi password baru"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-red-500" : ""}
                id="input-confirm-password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full font-semibold" disabled={loading} id="btn-reset-password">
              {loading ? "Menyimpan..." : "Simpan Password Baru"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-slate-500">
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Kembali ke Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
