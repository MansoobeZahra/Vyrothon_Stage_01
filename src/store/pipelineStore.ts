import { create } from 'zustand'
import { PipelineNode, NodeResult, RunMode, RoundTripResult } from '../types'
import { CIPHER_MAP } from '../ciphers'
import { PRESETS, Preset } from '../presets/presets'

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

interface PipelineStore {
  // State
  nodes: PipelineNode[]
  plaintext: string
  mode: RunMode
  results: NodeResult[]
  isRunning: boolean
  roundTripResult: RoundTripResult | null
  history: PipelineNode[][]
  historyIndex: number
  theme: 'dark' | 'light'

  // Node actions
  addNode: (cipherName: string) => void
  removeNode: (id: string) => void
  reorderNodes: (newOrder: PipelineNode[]) => void
  updateConfig: (id: string, field: string, value: string | number) => void
  moveNode: (id: string, direction: -1 | 1) => void

  // Pipeline actions
  setPlaintext: (text: string) => void
  setMode: (mode: RunMode) => void
  runPipeline: () => Promise<void>
  testRoundTrip: () => void
  clearResults: () => void

  // Undo / Redo
  undo: () => void
  redo: () => void

  // Presets
  loadPreset: (preset: Preset) => void

  // Import / Export
  exportPipeline: () => string
  importPipeline: (json: string) => void

  // Theme
  toggleTheme: () => void
}

function snapshot(nodes: PipelineNode[]): PipelineNode[] {
  return JSON.parse(JSON.stringify(nodes))
}

export const usePipelineStore = create<PipelineStore>((set, get) => ({
  nodes: PRESETS[0].nodes.map((n) => ({ ...n, id: uid() })),
  plaintext: PRESETS[0].plaintext,
  mode: 'encrypt',
  results: [],
  isRunning: false,
  roundTripResult: null,
  history: [],
  historyIndex: -1,
  theme: 'dark',

  // ── Node management ──────────────────────────────────────────────────────

  addNode: (cipherName) => {
    const cipher = CIPHER_MAP[cipherName]
    if (!cipher) return
    const node: PipelineNode = {
      id: uid(),
      cipherName,
      config: { ...cipher.defaultConfig },
    }
    const { nodes } = get()
    const next = [...nodes, node]
    pushHistory(set, get, next)
    set({ nodes: next, results: [], roundTripResult: null })
  },

  removeNode: (id) => {
    const next = get().nodes.filter((n) => n.id !== id)
    pushHistory(set, get, next)
    set({ nodes: next, results: [], roundTripResult: null })
  },

  reorderNodes: (newOrder) => {
    pushHistory(set, get, newOrder)
    set({ nodes: newOrder, results: [], roundTripResult: null })
  },

  updateConfig: (id, field, value) => {
    set((s) => ({
      nodes: s.nodes.map((n) => n.id === id ? { ...n, config: { ...n.config, [field]: value } } : n),
      results: [],
      roundTripResult: null,
    }))
  },

  moveNode: (id, direction) => {
    const { nodes } = get()
    const idx = nodes.findIndex((n) => n.id === id)
    if (idx < 0) return
    const next = [...nodes]
    const target = idx + direction
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    pushHistory(set, get, next)
    set({ nodes: next, results: [], roundTripResult: null })
  },

  // ── Pipeline ──────────────────────────────────────────────────────────────

  setPlaintext: (text) => set({ plaintext: text, results: [], roundTripResult: null }),
  setMode: (mode) => set({ mode, results: [], roundTripResult: null }),

  runPipeline: async () => {
    const { nodes, plaintext, mode } = get()
    if (nodes.length < 3) return
    set({ isRunning: true, results: [], roundTripResult: null })

    const ordered = mode === 'encrypt' ? nodes : [...nodes].reverse()
    const newResults: NodeResult[] = []
    let current = plaintext
    // stoppedEarly flag handled by break

    for (const node of ordered) {
      const cipher = CIPHER_MAP[node.cipherName]
      if (!cipher) continue

      const input = current
      try {
        const output = mode === 'encrypt'
          ? cipher.encrypt(input, node.config)
          : cipher.decrypt(input, node.config)
        newResults.push({ nodeId: node.id, input, output })
        current = output
      } catch (err) {
        newResults.push({ nodeId: node.id, input, output: '', error: (err as Error).message })
        // pipeline halted
        break
      }

      // Stagger animation
      set({ results: [...newResults] })
      await new Promise((r) => setTimeout(r, 180))
    }

    set({ isRunning: false, results: newResults })
  },

  testRoundTrip: () => {
    const { nodes, plaintext } = get()
    if (nodes.length < 3) return
    let current = plaintext
    try {
      // Encrypt pass
      for (const node of nodes) {
        const cipher = CIPHER_MAP[node.cipherName]
        current = cipher.encrypt(current, node.config)
      }
      void current // encrypted intermediate
      // Decrypt pass
      for (const node of [...nodes].reverse()) {
        const cipher = CIPHER_MAP[node.cipherName]
        current = cipher.decrypt(current, node.config)
      }
      set({
        roundTripResult: {
          success: current === plaintext,
          original: plaintext,
          recovered: current,
        },
      })
    } catch (err) {
      set({
        roundTripResult: {
          success: false,
          original: plaintext,
          recovered: `ERROR: ${(err as Error).message}`,
        },
      })
    }
  },

  clearResults: () => set({ results: [], roundTripResult: null }),

  // ── Undo / Redo ───────────────────────────────────────────────────────────

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    set({ nodes: snapshot(history[newIndex]), historyIndex: newIndex })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    set({ nodes: snapshot(history[newIndex]), historyIndex: newIndex })
  },

  // ── Presets ───────────────────────────────────────────────────────────────

  loadPreset: (preset) => {
    const nodes = preset.nodes.map((n) => ({ ...n, id: uid() }))
    pushHistory(set, get, nodes)
    set({ nodes, plaintext: preset.plaintext, results: [], roundTripResult: null })
  },

  // ── Import / Export ───────────────────────────────────────────────────────

  exportPipeline: () => {
    const { nodes, plaintext, mode } = get()
    return JSON.stringify({ nodes, plaintext, mode }, null, 2)
  },

  importPipeline: (json) => {
    const parsed = JSON.parse(json)
    const nodes: PipelineNode[] = (parsed.nodes ?? []).map((n: PipelineNode) => ({
      ...n,
      id: uid(),
    }))
    pushHistory(set, get, nodes)
    set({
      nodes,
      plaintext: parsed.plaintext ?? '',
      mode: parsed.mode ?? 'encrypt',
      results: [],
      roundTripResult: null,
    })
  },

  // ── Theme ─────────────────────────────────────────────────────────────────

  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'dark' ? 'light' : 'dark'
      document.documentElement.classList.toggle('light', next === 'light')
      return { theme: next }
    }),
}))

// Helper: push state to undo history
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pushHistory(set: (partial: Partial<PipelineStore>) => void, get: () => PipelineStore, nodes: PipelineNode[]) {
  const { history, historyIndex } = get()
  const trimmed = history.slice(0, historyIndex + 1)
  set({
    history: [...trimmed, snapshot(nodes)],
    historyIndex: trimmed.length,
  })
}
