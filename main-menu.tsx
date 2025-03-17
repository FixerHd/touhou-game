"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX } from "lucide-react"

interface MainMenuProps {
  onPlay: () => void
  onInstructions: () => void
  onSettings: () => void
  showInstructions: boolean
  showSettings: boolean
  onCloseInstructions: () => void
  onCloseSettings: () => void
  volume: number
  onVolumeChange: (value: number) => void
  isMuted: boolean
  onToggleMute: () => void
}

export default function MainMenu({
  onPlay,
  onInstructions,
  onSettings,
  showInstructions,
  showSettings,
  onCloseInstructions,
  onCloseSettings,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
}: MainMenuProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl w-full text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">
          Touhou: Infinite Nightmare of Computer Science
        </h1>
        <p className="text-lg text-gray-300">¡Sobrevive al infierno de balas de la ciencia de la computación!</p>
      </div>

      {!showInstructions && !showSettings && (
        <Card className="p-8 max-w-md w-full bg-gray-800 text-white border-purple-500">
          <div className="flex flex-col gap-4">
            <Button onClick={onPlay} className="py-6 text-lg bg-purple-600 hover:bg-purple-700">
              Jugar
            </Button>

            <Button onClick={onInstructions} variant="outline" className="py-6 text-lg">
              Instrucciones
            </Button>

            <Button onClick={onSettings} variant="outline" className="py-6 text-lg">
              Ajustes
            </Button>
          </div>
        </Card>
      )}

      {showInstructions && (
        <Card className="p-8 max-w-md w-full bg-gray-800 text-white border-purple-500">
          <h2 className="text-2xl font-bold mb-4">Instrucciones</h2>

          <div className="mb-6 text-left">
            <h3 className="font-bold text-lg mb-2">Controles:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Usa las <span className="font-bold">flechas del teclado</span> para mover tu nave
              </li>
              <li>
                Presiona la tecla <span className="font-bold">Z</span> para disparar
              </li>
              <li>Evita los proyectiles enemigos y sobrevive el mayor tiempo posible</li>
            </ul>
          </div>

          <div className="mb-6 text-left">
            <h3 className="font-bold text-lg mb-2">Enemigos:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="text-green-400 font-bold">Binario (01)</span>: Dispara en dos direcciones
              </li>
              <li>
                <span className="text-red-400 font-bold">Algoritmo (Θ)</span>: Dispara en patrones espirales
              </li>
              <li>
                <span className="text-blue-400 font-bold">Estructura de Datos {"{}"}</span>: Dispara en ondas
                sinusoidales
              </li>
            </ul>
          </div>

          <Button onClick={onCloseInstructions} className="w-full">
            Volver al Menú
          </Button>
        </Card>
      )}

      {showSettings && (
        <Card className="p-8 max-w-md w-full bg-gray-800 text-white border-purple-500">
          <h2 className="text-2xl font-bold mb-4">Ajustes</h2>

          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">Volumen de Música</h3>
            <div className="flex items-center gap-4">
              <button onClick={onToggleMute} className="text-white">
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <Slider
                value={[volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={(vals) => onVolumeChange(vals[0])}
                className="flex-1"
              />
              <span className="w-8 text-right">{volume}%</span>
            </div>
          </div>

          <Button onClick={onCloseSettings} className="w-full">
            Guardar y Volver
          </Button>
        </Card>
      )}
    </div>
  )
}

