import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Send, Bot, User, CheckCircle, X } from "lucide-react"
import toast from "react-hot-toast"
import {
  createChatSession,
  sendChatMessage,
  confirmChatSkills,
  cancelChatSession,
} from "../../api/student.api"
import { Button } from "../../components/ui/Button"
import { Spinner } from "../../components/ui/Spinner"

const LEVEL_OPTIONS = ["pemula", "menengah", "mahir"]
const LEVEL_COLORS = {
  pemula: "bg-blue-100 text-blue-700",
  menengah: "bg-amber-100 text-amber-700",
  mahir: "bg-emerald-100 text-emerald-700",
}

function MessageBubble({ message }) {
  const isBot = message.peran === "bot"
  return (
    <div className={`flex items-end gap-2 ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isBot
            ? "rounded-bl-sm bg-white border border-slate-200 text-slate-800"
            : "rounded-br-sm bg-blue-600 text-white"
        }`}
      >
        {message.isi_pesan}
      </div>
      {!isBot && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 shadow-sm">
          <User className="h-4 w-4 text-slate-600" />
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-white border border-slate-200 px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center">
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  )
}

function CompetencyDraft({ skills, onLevelChange, onRemove, onConfirm, onCancel, confirming }) {
  if (skills.length === 0) return null
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="h-5 w-5 text-emerald-600" />
        <h3 className="text-sm font-semibold text-emerald-800">
          Kompetensi Terdeteksi ({skills.length})
        </h3>
      </div>
      <div className="space-y-2 mb-4">
        {skills.map((sk) => (
          <div
            key={sk.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-white border border-emerald-200 px-3 py-2"
          >
            <span className="text-sm font-medium text-slate-800 flex-1 min-w-0 truncate">
              {sk.kompetensi?.nama_kompetensi ?? "Kompetensi"}
            </span>
            <select
              value={sk.level}
              onChange={(e) => onLevelChange(sk.id, e.target.value)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium border-0 cursor-pointer focus:outline-none ${LEVEL_COLORS[sk.level]}`}
            >
              {LEVEL_OPTIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <button
              onClick={() => onRemove(sk.id)}
              className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onConfirm}
          disabled={confirming}
          className="flex-1"
          id="btn-simpan-kompetensi-chatbot"
        >
          {confirming ? "Menyimpan..." : "Simpan ke Profil"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={confirming}
          id="btn-batal-konfirmasi"
        >
          Batal
        </Button>
      </div>
    </div>
  )
}

export default function Chatbot() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [skills, setSkills] = useState([]) // detected skills
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [starting, setStarting] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => { scrollToBottom() }, [messages, sending])

  async function startSession() {
    setStarting(true)
    try {
      const sess = await createChatSession()
      setSession(sess)
      setMessages([{
        id: "welcome",
        peran: "bot",
        isi_pesan: "Halo! Saya akan membantu memetakan kompetensimu. Ceritakan pengalaman, proyek, atau teknologi yang pernah kamu gunakan!",
      }])
      setSkills([])
      setSessionEnded(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal memulai sesi")
    } finally {
      setStarting(false)
    }
  }

  async function handleSend(e) {
    e?.preventDefault()
    if (!input.trim() || sending || !session) return

    const userMsg = { id: Date.now(), peran: "user", isi_pesan: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setSending(true)

    try {
      const res = await sendChatMessage(session.id, userMsg.isi_pesan)
      setMessages((prev) => [...prev, { id: Date.now() + 1, peran: "bot", isi_pesan: res.reply }])

      // Merge detected skills (upsert by id)
      if (res.skills?.length > 0) {
        setSkills((prev) => {
          const map = new Map(prev.map((s) => [s.id, s]))
          for (const sk of res.skills) map.set(sk.id, sk)
          return Array.from(map.values())
        })
      }

      if (res.selesai) setSessionEnded(true)
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal mengirim pesan")
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  function handleLevelChange(id, level) {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, level } : s)))
  }

  function handleRemoveSkill(id) {
    setSkills((prev) => prev.filter((s) => s.id !== id))
  }

  async function handleConfirm() {
    if (skills.length === 0) { toast.error("Tidak ada kompetensi untuk dikonfirmasi"); return }
    setConfirming(true)
    try {
      await confirmChatSkills(session.id, skills.map((s) => ({ id: s.id, level: s.level })))
      toast.success("Kompetensi berhasil disimpan ke profil!")
      navigate("/app/rekomendasi")
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal menyimpan")
    } finally {
      setConfirming(false)
    }
  }

  async function handleCancelSession() {
    if (!session) return
    try {
      await cancelChatSession(session.id)
      setSession(null)
      setMessages([])
      setSkills([])
      setSessionEnded(false)
    } catch { /* ignore */ }
  }

  // ── No session yet ─────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg">
          <Bot className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analisis Kompetensi</h1>
          <p className="mt-3 text-slate-500 max-w-md">
            Ceritakan pengalamanmu kepada AI kami. Kami akan mengidentifikasi kompetensimu dan
            memberikan rekomendasi magang yang tepat.
          </p>
        </div>
        <div className="flex flex-col gap-3 items-center text-sm text-slate-500">
          {["Tanya-jawab cerdas berbasis AI", "Deteksi otomatis kompetensi", "Langsung tersimpan ke profilmu"].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              {f}
            </div>
          ))}
        </div>
        <Button size="lg" onClick={startSession} disabled={starting} id="btn-mulai-chatbot">
          {starting ? <Spinner className="mr-2" /> : <Bot className="mr-2 h-5 w-5" />}
          {starting ? "Memulai..." : "Mulai Analisis Kompetensi"}
        </Button>
      </div>
    )
  }

  // ── Active session ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Asisten Kompetensi</p>
            <p className={`text-xs font-medium flex items-center gap-1 ${sessionEnded ? "text-slate-500" : "text-emerald-500"}`}>
              <span className={`h-1.5 w-1.5 rounded-full inline-block ${sessionEnded ? "bg-slate-400" : "bg-emerald-500 animate-pulse"}`} />
              {sessionEnded ? "Sesi Selesai" : "Online"}
            </p>
          </div>
        </div>
        <button
          onClick={handleCancelSession}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title="Batalkan sesi"
          id="btn-batalkan-sesi"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50 border-x border-slate-200 px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {sending && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Competency draft */}
      {skills.length > 0 && (
        <div className="border-x border-slate-200 bg-white px-4 py-3">
          <CompetencyDraft
            skills={skills}
            onLevelChange={handleLevelChange}
            onRemove={handleRemoveSkill}
            onConfirm={handleConfirm}
            onCancel={() => setSkills([])}
            confirming={confirming}
          />
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 rounded-b-xl border border-t-0 border-slate-200 bg-white px-3 py-3"
      >
        <textarea
          ref={inputRef}
          id="input-pesan-chatbot"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
          }}
          placeholder={sessionEnded ? "Sesi telah selesai. Simpan kompetensimu di atas." : "Ketik pesanmu... (Enter untuk kirim)"}
          disabled={sessionEnded || sending}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 max-h-32"
          style={{ minHeight: "40px" }}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending || sessionEnded}
          id="btn-kirim-pesan"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  )
}
