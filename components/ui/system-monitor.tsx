"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cpu, HardDrive, Wifi, Zap, Activity } from "lucide-react"

interface DataPoint {
  value: number
  timestamp: number
  isSpike?: boolean
}

interface ResourceData {
  cpu: DataPoint[]
  gpu: DataPoint[]
  vram: DataPoint[]
  network: DataPoint[]
  memory: DataPoint[]
}

interface Agent {
  id: string
  name: string
  memory: DataPoint[]
  color: string
}

const generateDataPoint = (baseValue: number, variance: number, spikeChance = 0.05): DataPoint => {
  const isSpike = Math.random() < spikeChance
  const multiplier = isSpike ? 1.5 + Math.random() * 0.5 : 1
  const value = Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance * multiplier))
  return { value, timestamp: Date.now(), isSpike: isSpike && value > 70 }
}

const Sparkline = ({ data, color = "#3b82f6", spikeColor = "#ef4444", width = 60, height = 20 }: { data: DataPoint[]; color?: string; spikeColor?: string; width?: number; height?: number }) => {
  if (data.length < 2) return <svg width={width} height={height} />

  const points = data.map((point, index) => ({
    x: (index / (data.length - 1)) * width,
    y: height - (point.value / 100) * height,
    isSpike: point.isSpike,
  }))
  const path = points.reduce((acc, point, index) => index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`, "")
  const hasSpikes = points.some((p) => p.isSpike)

  return (
    <svg width={width} height={height} className="overflow-visible">
      <motion.path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill={hasSpikes ? `${spikeColor}33` : `${color}33`} />
      <motion.path d={path} fill="none" stroke={hasSpikes ? spikeColor : color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => point.isSpike ? <motion.circle key={index} cx={point.x} cy={point.y} r={2} fill={spikeColor} initial={{ scale: 0 }} animate={{ scale: 1 }} /> : null)}
    </svg>
  )
}

const ResourceCard = ({ icon: Icon, label, value, data, color, unit = "%" }: { icon: React.ElementType; label: string; value: number; data: DataPoint[]; color: string; unit?: string }) => {
  const hasSpikes = data.some((d) => d.isSpike)
  return (
    <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50">
      <div className={`flex items-center justify-center w-7 h-7 rounded-md bg-muted ${hasSpikes ? "bg-red-50" : ""}`}>
        <Icon className={`w-4 h-4 ${hasSpikes ? "text-red-500" : "text-muted-foreground"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <span className={`text-xs font-mono ${hasSpikes ? "text-red-500" : "text-foreground"}`}>{value.toFixed(1)} {unit}</span>
        </div>
        <div className="mt-1"><Sparkline data={data} color={color} /></div>
      </div>
    </div>
  )
}

const AgentMemoryCard = ({ agent }: { agent: Agent }) => {
  const currentValue = agent.memory[agent.memory.length - 1]?.value || 0
  const hasSpikes = agent.memory.some((d) => d.isSpike)
  return (
    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/30">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hasSpikes ? "#ef4444" : agent.color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground truncate">{agent.name}</span>
          <span className={`text-xs font-mono ml-2 ${hasSpikes ? "text-red-500" : "text-foreground"}`}>{currentValue.toFixed(0)}MB</span>
        </div>
        <div className="mt-1"><Sparkline data={agent.memory} color={agent.color} width={40} height={12} /></div>
      </div>
    </div>
  )
}

export default function SystemMonitor() {
  const [resourceData, setResourceData] = useState<ResourceData>({ cpu: [], gpu: [], vram: [], network: [], memory: [] })
  const [agents] = useState<Agent[]>([
    { id: "1", name: "LAÇİN AI", memory: [], color: "#3b82f6" },
    { id: "2", name: "ODBARS CV", memory: [], color: "#10b981" },
    { id: "3", name: "HomeAgent", memory: [], color: "#f59e0b" },
    { id: "4", name: "EGENODE", memory: [], color: "#8b5cf6" },
  ])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setResourceData((prev) => ({
        cpu: [...prev.cpu, generateDataPoint(45, 30, 0.08)].slice(-20),
        gpu: [...prev.gpu, generateDataPoint(35, 25, 0.06)].slice(-20),
        vram: [...prev.vram, generateDataPoint(60, 20, 0.05)].slice(-20),
        network: [...prev.network, generateDataPoint(25, 40, 0.1)].slice(-20),
        memory: [...prev.memory, generateDataPoint(70, 15, 0.04)].slice(-20),
      }))
      agents.forEach((agent) => {
        const base = agent.id === "1" ? 150 : agent.id === "2" ? 200 : agent.id === "3" ? 80 : 120
        agent.memory = [...agent.memory, generateDataPoint(base, 50, 0.06)].slice(-15)
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [agents])

  const currentCpu = resourceData.cpu[resourceData.cpu.length - 1]?.value || 0
  const currentGpu = resourceData.gpu[resourceData.gpu.length - 1]?.value || 0
  const currentVram = resourceData.vram[resourceData.vram.length - 1]?.value || 0
  const currentNetwork = resourceData.network[resourceData.network.length - 1]?.value || 0
  const currentMemory = resourceData.memory[resourceData.memory.length - 1]?.value || 0
  const hasAnySpikes = [...resourceData.cpu, ...resourceData.gpu, ...resourceData.vram, ...resourceData.network, ...resourceData.memory, ...agents.flatMap((a) => a.memory)].some((d) => d.isSpike)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence mode="wait">
        {!isVisible ? (
          <motion.button
            key="toggle"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => setIsVisible(true)}
            className="w-9 h-9 rounded-full bg-background/95 backdrop-blur-sm border shadow-lg flex items-center justify-center hover:border-emerald-500/40 transition-colors"
            title="Show Dev Monitor"
          >
            <Activity className={`w-4 h-4 ${hasAnySpikes ? "text-red-500" : "text-muted-foreground"}`} />
          </motion.button>
        ) : (
          <motion.div
            key="monitor"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="w-80 bg-background/95 backdrop-blur-sm border shadow-lg">
              <motion.div className="p-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className={`w-4 h-4 ${hasAnySpikes ? "text-red-500" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">Dev Monitor</span>
                    {hasAnySpikes && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Badge variant="destructive" className="text-xs text-white px-1.5 py-0.5">Spike</Badge>
                      </motion.div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-muted-foreground text-xs">▼</motion.div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
                      className="ml-1.5 w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs"
                      title="Hide"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <ResourceCard icon={Cpu} label="CPU" value={currentCpu} data={resourceData.cpu} color="#3b82f6" />
                  <ResourceCard icon={Zap} label="GPU" value={currentGpu} data={resourceData.gpu} color="#10b981" />
                  <ResourceCard icon={HardDrive} label="VRAM" value={currentVram} data={resourceData.vram} color="#f59e0b" />
                  <ResourceCard icon={Wifi} label="Network" value={currentNetwork} data={resourceData.network} color="#8b5cf6" unit="MB/s" />
                </div>
              </motion.div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-3 pb-3 border-t">
                      <div className="mt-3 mb-2">
                        <ResourceCard icon={HardDrive} label="System Memory" value={currentMemory} data={resourceData.memory} color="#ef4444" unit="GB" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Per-Project Memory</span>
                        {agents.map((agent, index) => (
                          <motion.div key={agent.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.1 }}>
                            <AgentMemoryCard agent={agent} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
