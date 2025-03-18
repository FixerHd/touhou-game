"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX } from "lucide-react"
import MainMenu from "./main-menu"

export default function TouhouGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [showMenu, setShowMenu] = useState(true)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Game state refs to avoid recreating the game loop on state changes
  const scoreRef = useRef(score)
  const livesRef = useRef(lives)
  const gameOverRef = useRef(gameOver)

  // Keep refs in sync with state
  useEffect(() => {
    scoreRef.current = score
  }, [score])

  useEffect(() => {
    livesRef.current = lives
  }, [lives])

  useEffect(() => {
    gameOverRef.current = gameOver
  }, [gameOver])

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/bgm.mp3")
    audioRef.current.loop = true

    return () => {
      if (audioRef.current) {
        audioRef.current.stop()
        audioRef.current = null
      }
    }
  }, [])

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  useEffect(() => {
    if (!gameStarted || gameOver) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      return
    }

    if (audioRef.current) {
      audioRef.current.play().catch((e) => console.log("Audio play failed:", e))
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Game variables
    let animationFrameId: number
    let bullets: Bullet[] = []
    let enemies: Enemy[] = []
    let lastEnemySpawn = 0
    let lastBulletTime = 0

    // Player
    const player = {
      x: canvas.width / 2,
      y: canvas.height - 50,
      width: 20,
      height: 30,
      speed: 5,
      color: "#ff77ff",
      hitboxRadius: 5,
      invulnerable: false,
      invulnerableTime: 0,
      keys: {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        z: false,
      },
    }

    // Classes
    class Bullet {
      x: number
      y: number
      radius: number
      color: string
      speedX: number
      speedY: number
      pattern: string
      angle: number
      isPlayerBullet: boolean

      constructor(
        x: number,
        y: number,
        radius: number,
        color: string,
        speedX: number,
        speedY: number,
        pattern: string,
        isPlayerBullet = false,
      ) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.speedX = speedX
        this.speedY = speedY
        this.pattern = pattern
        this.angle = 0
        this.isPlayerBullet = isPlayerBullet
      }

      update() {
        if (this.pattern === "straight") {
          this.x += this.speedX
          this.y += this.speedY
        } else if (this.pattern === "sine") {
          this.x += this.speedX
          this.y += this.speedY
          this.x += Math.sin(this.y / 20) * 2
        } else if (this.pattern === "spiral") {
          this.angle += 0.05
          this.x += Math.cos(this.angle) * 2 + this.speedX
          this.y += Math.sin(this.angle) * 2 + this.speedY
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.closePath()
      }
    }

    class Enemy {
      x: number
      y: number
      width: number
      height: number
      speed: number
      color: string
      health: number
      type: string
      lastShot: number
      shootInterval: number

      constructor(x: number, y: number, type: string) {
        this.x = x
        this.y = y
        this.width = 30
        this.height = 30
        this.speed = 1
        this.type = type
        this.lastShot = 0

        if (type === "binary") {
          this.color = "#00ff00"
          this.health = 3
          this.shootInterval = 1000
        } else if (type === "algorithm") {
          this.color = "#ff0000"
          this.health = 5
          this.shootInterval = 800
        } else {
          this.color = "#0000ff"
          this.health = 2
          this.shootInterval = 1200
        }
      }

      update(currentTime: number) {
        this.y += this.speed

        // Shoot bullets
        if (currentTime - this.lastShot > this.shootInterval) {
          this.shoot()
          this.lastShot = currentTime
        }
      }

      shoot() {
        if (this.type === "binary") {
          // Binary enemy shoots in two directions
          bullets.push(new Bullet(this.x, this.y, 5, "#00ff00", -1.5, 3, "straight"))
          bullets.push(new Bullet(this.x, this.y, 5, "#00ff00", 1.5, 3, "straight"))
        } else if (this.type === "algorithm") {
          // Algorithm enemy shoots in a spiral pattern
          for (let i = 0; i < 8; i++) {
            const angle = ((Math.PI * 2) / 8) * i
            bullets.push(
              new Bullet(this.x, this.y, 4, "#ff0000", Math.cos(angle) * 2, Math.sin(angle) * 2 + 1, "spiral"),
            )
          }
        } else {
          // Default enemy shoots in sine wave
          bullets.push(new Bullet(this.x, this.y, 6, "#0000ff", 0, 3, "sine"))
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height)

        // Draw enemy type symbol
        ctx.fillStyle = "#000"
        ctx.font = "16px monospace"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        if (this.type === "binary") {
          ctx.fillText("01", this.x, this.y)
        } else if (this.type === "algorithm") {
          ctx.fillText("Θ", this.x, this.y)
        } else {
          ctx.fillText("{}", this.x, this.y)
        }
      }
    }

    // Event listeners
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key in player.keys) {
        player.keys[e.key as keyof typeof player.keys] = true
      }
    }

    const keyUpHandler = (e: KeyboardEvent) => {
      if (e.key in player.keys) {
        player.keys[e.key as keyof typeof player.keys] = false
      }
    }

    window.addEventListener("keydown", keyDownHandler)
    window.addEventListener("keyup", keyUpHandler)

    // Game functions
    const spawnEnemy = (currentTime: number) => {
      if (currentTime - lastEnemySpawn > 2000) {
        const types = ["binary", "algorithm", "datastructure"]
        const type = types[Math.floor(Math.random() * types.length)]
        const x = Math.random() * (canvas.width - 30) + 15
        enemies.push(new Enemy(x, 0, type))
        lastEnemySpawn = currentTime
      }
    }

    const playerShoot = (currentTime: number) => {
      if (player.keys.z && currentTime - lastBulletTime > 200) {
        bullets.push(new Bullet(player.x, player.y - 20, 4, "#ffffff", 0, -8, "straight", true))
        lastBulletTime = currentTime
      }
    }

    const movePlayer = () => {
      if (player.keys.ArrowLeft && player.x > player.width / 2) {
        player.x -= player.speed
      }
      if (player.keys.ArrowRight && player.x < canvas.width - player.width / 2) {
        player.x += player.speed
      }
      if (player.keys.ArrowUp && player.y > player.height / 2) {
        player.y -= player.speed
      }
      if (player.keys.ArrowDown && player.y < canvas.height - player.height / 2) {
        player.y += player.speed
      }
    }

    const checkCollisions = (currentTime: number) => {
      // Check player collision with enemy bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i]

        if (!bullet.isPlayerBullet) {
          const dx = bullet.x - player.x
          const dy = bullet.y - player.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < bullet.radius + player.hitboxRadius && !player.invulnerable) {
            bullets.splice(i, 1)
            livesRef.current -= 1

            // Update lives state safely
            setLives(livesRef.current)

            if (livesRef.current <= 0) {
              gameOverRef.current = true
              setGameOver(true)
            } else {
              // Make player invulnerable for 2 seconds
              player.invulnerable = true
              player.invulnerableTime = currentTime
            }
          }
        } else {
          // Check player bullets with enemies
          let bulletHit = false

          for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j]

            if (
              bullet.x > enemy.x - enemy.width / 2 &&
              bullet.x < enemy.x + enemy.width / 2 &&
              bullet.y > enemy.y - enemy.height / 2 &&
              bullet.y < enemy.y + enemy.height / 2
            ) {
              bulletHit = true
              enemy.health--

              if (enemy.health <= 0) {
                enemies.splice(j, 1)
                scoreRef.current += 100
                // Update score state safely
                setScore(scoreRef.current)
              }

              break
            }
          }

          if (bulletHit) {
            bullets.splice(i, 1)
          }
        }
      }

      // Check invulnerability timer
      if (player.invulnerable && currentTime - player.invulnerableTime > 2000) {
        player.invulnerable = false
      }
    }

    const drawPlayer = (currentTime: number) => {
      // Flashing effect when invulnerable
      if (player.invulnerable && Math.floor(currentTime / 100) % 2 === 0) {
        return
      }

      // Draw player ship
      ctx.fillStyle = player.color
      ctx.beginPath()
      ctx.moveTo(player.x, player.y - player.height / 2)
      ctx.lineTo(player.x - player.width / 2, player.y + player.height / 2)
      ctx.lineTo(player.x + player.width / 2, player.y + player.height / 2)
      ctx.closePath()
      ctx.fill()
    }

    const drawBackground = () => {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "#000033")
      gradient.addColorStop(1, "#000022")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid lines
      ctx.strokeStyle = "rgba(0, 255, 0, 0.1)"
      ctx.lineWidth = 1

      // Vertical lines
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }

    // Main game loop
    const render = (currentTime: number) => {
      if (gameOverRef.current) {
        cancelAnimationFrame(animationFrameId)
        return
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      drawBackground()

      // Spawn enemies
      spawnEnemy(currentTime)

      // Player shooting
      playerShoot(currentTime)

      // Move player
      movePlayer()

      // Update and draw bullets
      bullets = bullets.filter((bullet) => {
        bullet.update()
        bullet.draw(ctx)
        return bullet.x > -10 && bullet.x < canvas.width + 10 && bullet.y > -10 && bullet.y < canvas.height + 10
      })

      // Update and draw enemies
      enemies = enemies.filter((enemy) => {
        enemy.update(currentTime)
        enemy.draw(ctx)
        return enemy.y < canvas.height + 20
      })

      // Check collisions
      checkCollisions(currentTime)

      // Draw player
      drawPlayer(currentTime)

      // Request next frame
      animationFrameId = requestAnimationFrame(render)
    }

    // Start game loop
    animationFrameId = requestAnimationFrame(render)

    // Cleanup
    return () => {
      window.removeEventListener("keydown", keyDownHandler)
      window.removeEventListener("keyup", keyUpHandler)
      cancelAnimationFrame(animationFrameId)
    }
  }, [gameStarted]) // Only depend on gameStarted to avoid recreating the game loop

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setLives(3)
    setShowMenu(false)

    // Reset refs
    scoreRef.current = 0
    livesRef.current = 3
    gameOverRef.current = false
  }

  const restartGame = () => {
    startGame()
  }

  const returnToMenu = () => {
    setGameStarted(false)
    setGameOver(false)
    setShowMenu(true)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  if (showMenu) {
    return (
      <MainMenu
        onPlay={startGame}
        onInstructions={() => setShowInstructions(true)}
        onSettings={() => setShowSettings(true)}
        showInstructions={showInstructions}
        showSettings={showSettings}
        onCloseInstructions={() => setShowInstructions(false)}
        onCloseSettings={() => setShowSettings(false)}
        volume={volume}
        onVolumeChange={setVolume}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />
    )
  }

  return (
    <div className="flex flex-col md:flex-row items-start justify-center min-h-screen bg-gray-900 p-4">
      <div className="relative">
        <canvas ref={canvasRef} width={500} height={700} className="border border-purple-500 bg-black" />
      </div>

      <div className="md:ml-6 w-full md:w-64 mt-4 md:mt-0">
        <Card className="p-4 bg-gray-800 text-white border-purple-500 mb-4">
          <h1 className="text-xl font-bold text-purple-400 mb-2">Touhou: Infinite Nightmare of Computer Science</h1>

          <div className="mb-4 border-t border-gray-700 pt-2">
            <h2 className="text-lg font-bold">Puntuación</h2>
            <p className="text-2xl font-bold text-green-400">{score}</p>
          </div>

          <div className="mb-4 border-t border-gray-700 pt-2">
            <h2 className="text-lg font-bold">Vidas</h2>
            <div className="flex">
              {[...Array(lives)].map((_, i) => (
                <div key={i} className="w-6 h-6 mr-1 text-red-500">
                  ❤️
                </div>
              ))}
              {[...Array(3 - lives)].map((_, i) => (
                <div key={i} className="w-6 h-6 mr-1 text-gray-600">
                  ❤️
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4 border-t border-gray-700 pt-2">
            <h2 className="text-lg font-bold">Audio</h2>
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <Slider
                value={[volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={(vals) => setVolume(vals[0])}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-700 pt-2">
            <Button onClick={returnToMenu} variant="outline" className="w-full">
              Menú Principal
            </Button>

            {gameOver && (
              <Button onClick={restartGame} className="w-full bg-purple-600 hover:bg-purple-700">
                Reintentar
              </Button>
            )}
          </div>
        </Card>
      </div>

      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
          <Card className="p-6 max-w-md bg-gray-800 text-white border-red-500">
            <h2 className="text-2xl font-bold text-center mb-4">Game Over</h2>
            <p className="text-center mb-4">Puntuación Final: {score}</p>
            <div className="flex gap-2">
              <Button onClick={returnToMenu} variant="outline" className="flex-1">
                Menú Principal
              </Button>
              <Button onClick={restartGame} className="flex-1 bg-purple-600 hover:bg-purple-700">
                Reintentar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Hidden audio element to preload the music */}
      <audio src="/bgm.mp3" preload="auto" className="hidden" />
    </div>
  )
}

