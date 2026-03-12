import "./globals.css"
import Link from "next/link"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-[#F5F1EB] text-gray-900">

        {/* HEADER DINÁMICO */}
        <header className="bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-b-3xl p-6 shadow-md">
          <div className="max-w-5xl mx-auto">
            <p className="text-sm text-white/80 tracking-wide">FINANZAS</p>
            <h1 className="text-2xl font-semibold text-white">
              Control Estratégico
            </h1>
          </div>
        </header>

        {/* CONTENIDO */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24">
          {children}
        </main>

        {/* FOOTER FIJO FUNCIONAL */}
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around z-50 shadow-sm">

          <Link href="/" className="text-sm text-gray-600 hover:text-black">
            Inicio
          </Link>

          <Link href="/fisico" className="text-sm text-gray-600 hover:text-black">
            Físico
          </Link>

          <Link href="/finanzas/overview" className="text-sm text-gray-600 hover:text-black">
            Finanzas
          </Link>

          <Link href="/profesional" className="text-sm text-gray-600 hover:text-black">
            Profesional
          </Link>

          <Link href="/sistema" className="text-sm text-gray-600 hover:text-black">
            Sistema
          </Link>

        </footer>

      </body>
    </html>
  )
}
