"use client"

import { useState } from "react"
import Section from "@/app/components/Section"
import ScaleInput from "@/app/components/ScaleInput"

export default function CheckinPage() {
  const today = new Date().toISOString().split("T")[0]

  const [form, setForm] = useState<any>({
    fecha: today,
    hoy: true,
    ayer: false,

    calidadSueno: "",
    energia: "",
    ansiedad: "",
    estadoAnimo: "",

    entreno: false,
    tipoEntreno: "",
    minutosEntreno: "",
    peso: "",
    cintura: "",

    calidadConexion: "",

    deepWork: "",
    productividad: ""
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value })
  }

  const handleSubmit = async () => {
    if (!form.calidadSueno || !form.energia || !form.estadoAnimo) {
      alert("Completa los campos principales")
      return
    }

    setLoading(true)
    setSuccess(false)

    await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setLoading(false)
    setSuccess(true)

    setTimeout(() => setSuccess(false), 2000)
  }

  const scaleOptions = Array.from({ length: 10 }, (_, i) => i + 1)


return (
  <div className="space-y-10 pb-28">

    {/* =========================
        ESTADO MENTAL
    ========================== */}
    <div className="bg-rose-50 rounded-2xl p-6 space-y-6">
      <h2 className="text-lg font-semibold text-rose-600">
        Estado Mental
      </h2>

      {[
        { label: "Sueño", key: "calidadSueno" },
        { label: "Energía", key: "energia" },
        { label: "Ansiedad", key: "ansiedad" },
        { label: "Estado ánimo", key: "estadoAnimo" },
      ].map((item) => (
        <div key={item.key} className="space-y-2">
          <p className="text-sm text-gray-600">{item.label}</p>

          <div className="flex gap-2 flex-wrap">
            {scaleOptions.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleChange(item.key, n)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition
                  ${
                    form[item.key] === n
                      ? "bg-rose-500 text-white"
                      : "bg-white border border-rose-200 text-rose-500"
                  }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* =========================
        ENTRENAMIENTO
    ========================== */}
    <div className="bg-blue-50 rounded-2xl p-6 space-y-6">
      <h2 className="text-lg font-semibold text-blue-600">
        Entrenamiento
      </h2>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.entreno}
          onChange={(e) =>
            handleChange("entreno", e.target.checked)
          }
          className="w-4 h-4"
        />
        <span className="text-sm text-gray-700">
          Hoy entrené
        </span>
      </div>

      {form.entreno && (
        <div className="space-y-4">

          <div>
            <label className="text-sm text-gray-600">
              Tipo de entrenamiento
            </label>
            <select
              value={form.tipoEntreno}
              onChange={(e) =>
                handleChange("tipoEntreno", e.target.value)
              }
              className="w-full mt-1 p-2 rounded-lg border border-gray-300"
            >
              <option value="">Seleccionar</option>
              <option>Push Volumen</option>
              <option>Upper Pesado</option>
              <option>Upper Metabolico</option>
              <option>Pull Espalda Dominante</option>
              <option>Deltoide Especializacion</option>
              <option>Lower Mantenimiento</option>
              <option>Natacion</option>
              <option>Dia de descanso</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Minutos entrenados
            </label>
            <input
              type="number"
              value={form.minutosEntreno}
              onChange={(e) =>
                handleChange("minutosEntreno", e.target.value)
              }
              className="w-full mt-1 p-2 rounded-lg border border-gray-300"
              placeholder="Ej: 60"
            />
          </div>

        </div>
      )}
    </div>

    {/* =========================
        PRODUCTIVIDAD
    ========================== */}
    <div className="bg-emerald-50 rounded-2xl p-6 space-y-6">
      <h2 className="text-lg font-semibold text-emerald-600">
        Productividad
      </h2>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">Deep Work</p>
        <input
          type="number"
          value={form.deepWork}
          onChange={(e) =>
            handleChange("deepWork", e.target.value)
          }
          className="w-full p-2 rounded-lg border border-gray-300"
          placeholder="Horas"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">Productividad (1-10)</p>
        <div className="flex gap-2 flex-wrap">
          {scaleOptions.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleChange("productividad", n)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition
                ${
                  form.productividad === n
                    ? "bg-emerald-500 text-white"
                    : "bg-white border border-emerald-200 text-emerald-600"
                }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* =========================
        BOTÓN GUARDAR
    ========================== */}
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-xl font-medium"
      >
        {loading ? "Guardando..." : "Guardar Check-in"}
      </button>

      {success && (
        <p className="text-center text-sm text-green-600 mt-2">
          Guardado correctamente
        </p>
      )}
    </div>

  </div>
)
}
