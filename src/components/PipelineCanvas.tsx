import React from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { usePipelineStore } from '../store/pipelineStore'
import { CipherNode } from './CipherNode'
import clsx from 'clsx'
import { ArrowUp, AlertTriangle } from 'lucide-react'

export const PipelineCanvas: React.FC = () => {
  const { nodes, results, isRunning, mode, reorderNodes, theme } = usePipelineStore()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = nodes.findIndex((n) => n.id === active.id)
    const newIdx = nodes.findIndex((n) => n.id === over.id)
    reorderNodes(arrayMove(nodes, oldIdx, newIdx))
  }

  const accentColor = mode === 'decrypt' ? '#0088ff' : '#00fa9a'
  const orderedForDisplay = mode === 'decrypt' ? [...nodes].reverse() : nodes
  const isDark = theme === 'dark'

  return (
    <div className={clsx(
      'flex-1 overflow-y-auto px-8 relative',
      isDark ? 'bg-transparent' : 'bg-transparent'
    )}>
      {/* Top Banner (Count / Status) */}
      <div className="sticky top-0 z-20 py-4 flex items-center justify-center pointer-events-none">
        <div className={clsx(
          'px-5 py-2 rounded-full shadow-lg border backdrop-blur-md flex items-center gap-3 text-sm font-semibold tracking-wide',
          isDark ? 'bg-black/60 border-white/10 text-gray-200' : 'bg-white/80 border-gray-200 text-gray-800'
        )}>
          <span>
            {nodes.length} Cipher{nodes.length !== 1 ? 's' : ''} Linked
          </span>
          <span className="w-px h-4 bg-gray-500/30" />
          {nodes.length >= 3 ? (
            <span style={{ color: accentColor }}>Valid Pipeline ✓</span>
          ) : (
            <span className="text-yellow-500 flex items-center gap-1">
              <AlertTriangle size={14} /> Add {3 - nodes.length} more
            </span>
          )}
        </div>
      </div>

      {nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--muted)] pb-20">
          <div className="text-6xl opacity-20 filter grayscale">⛓️</div>
          <h2 className="text-xl font-bold">Pipeline Empty</h2>
          <p className="text-sm">Click ciphers in the left sidebar to add them here.</p>
        </div>
      ) : (
        <div className="pb-32 pt-4">
          {mode === 'decrypt' && (
            <div className="max-w-2xl mx-auto mb-6 flex justify-center">
              <div className="flex items-center gap-2 bg-[#0088ff]/10 text-[#0088ff] border border-[#0088ff]/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,136,255,0.2)]">
                <ArrowUp size={14} /> Reversed Execution Order
              </div>
            </div>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col items-center max-w-2xl mx-auto">
                {orderedForDisplay.map((node, i) => {
                  const actualIndex = mode === 'decrypt' ? nodes.length - 1 - i : i
                  const result = results.find((r) => r.nodeId === node.id)
                  const isRunningThis = isRunning && result === undefined && results.length === i
                  
                  return (
                    <React.Fragment key={node.id}>
                      <CipherNode
                        node={node}
                        index={actualIndex}
                        result={result}
                        isRunning={isRunningThis}
                      />

                      {/* Animated Arrow Drop */}
                      {i < nodes.length - 1 && (
                        <div className="flex flex-col items-center py-2 h-14" aria-hidden>
                          <div
                            className={clsx(
                              "w-1 transition-all duration-300 rounded-full",
                              isRunning ? (mode === 'decrypt' ? 'animate-arrow-up' : 'animate-arrow-down') : 'h-10 opacity-40'
                            )}
                            style={{
                              background: `linear-gradient(to bottom, ${accentColor}00, ${accentColor}, ${accentColor}00)`,
                              boxShadow: isRunning ? `0 0 10px ${accentColor}` : 'none',
                              height: isRunning ? '200%' : '100%'
                            }}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}
