import { NextResponse } from "next/server"
import { sheets } from "@/lib/googleAuth"

const SPREADSHEET_ID = "1fEP_Em30-BTUhmeObzAE9zObQRc7CNkYXbVCecpCHO0"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const newRow = [
      body.fecha || "",                 
      "", "", "",                       
      body.horaDespertar || "",         
      body.horaDormir || "",            
      "",                               
      body.calidadSueno || "",          
      body.energia || "",               
      body.ansiedad || "",              
      body.estadoAnimo || "",           
      body.dietaCumplida || 0,          
      body.agua || "",                  
      "", "", "",                       
      body.meditacion || "",            
      body.lectura || "",               
      body.avanceProyecto || 0,         
      body.tiempoPareja || 0,           
      body.calidadConexion || "",       
      body.interaccionSocial || 0,      
      body.entreno || 0,                
      body.tipoEntreno || "",           
      body.minutosEntreno || "",        
      body.deepWork || "",              
      body.productividad || "",         
      "",                               
      body.peso || "",                  
      "", "",                           
      body.cintura || "",               
      "",                               
      "",                               
      body.pecho || "",                 
      body.hombros || "",               
      body.bicepsDer || "",             
      body.bicepsIzq || "",             
      body.cuadricepsDer || "",         
      body.cuadricepsIzq || "",         
      body.gluteos || "",               
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Check In Diario!A2",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [newRow],
      },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error guardando check-in" },
      { status: 500 }
    )
  }
}
