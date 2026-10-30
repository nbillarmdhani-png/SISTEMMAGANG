import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"
import api from "../../api/axios"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card"

const schema = z.object({
  email: z.string().email("Format email tidak valid"),
})

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.post("/auth/forgot-password", data)
      setSent(true)
    } catch {
      toast.error("Gagal mengirim permintaan. Coba beberapa saat lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-none ring-1 ring-slate-200/50">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Lupa Kata Sandi
          </CardTitle>
          <CardDescription className="text-slate-500">
            {sent
              ? "Periksa email Anda untuk tautan reset kata sandi."
              : "Masukkan email yang terdaftar untuk mendapatkan tautan reset kata sandi."}
          </CardDescription>
        </CardHeader>
        {!sent && (
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="form-forgot-password">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-slate-700">Email</label>
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                  id="input-email-forgot"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full font-semibold" disabled={loading} id="btn-kirim-reset">
                {loading ? "Mengirim..." : "Kirim Tautan Reset"}
              </Button>
            </form>
          </CardContent>
        )}
        <CardFooter className="justify-center text-sm text-slate-500">
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Kembali ke Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
