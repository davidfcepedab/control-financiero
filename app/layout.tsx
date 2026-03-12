import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-neutral-100">

        {/* CONTENIDO */}
        <main className="flex-1 pb-20">
          {children}
        </main>

        {/* FOOTER FIJO */}
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around z-50">
          <span>Inicio</span>
          <span>Físico</span>
          <span>Finanzas</span>
          <span>Profesional</span>
          <span>Sistema</span>
        </footer>

      </body>
    </html>
  )
}
