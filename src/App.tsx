import React, { useEffect } from 'react'
import { usePipelineStore } from './store/pipelineStore'
import { Sidebar } from './components/Sidebar'
import { PipelineCanvas } from './components/PipelineCanvas'
import { RightSidebar } from './components/RightSidebar'

export const App: React.FC = () => {
  const { theme, runPipeline, nodes } = usePipelineStore()

  // Auto-run on first load
  useEffect(() => {
    if (nodes.length >= 3) {
      runPipeline()
    }
  }, [])

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ fontFamily: theme === 'dark' ? "'Inter', sans-serif" : "'Inter', sans-serif" }}
    >
      <Sidebar />
      <PipelineCanvas />
      <RightSidebar />
    </div>
  )
}
