import os

file_path = 'components/stacked-projects.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_str = '{/* Right Column: Live Visual Architecture Telemetry (5 Cols) */}'
end_str = '{/* Final State Output */}'

# Wait, I need to include the rest of the agentic visualizer to delete it.
# The end is `</div>\n            )}` after the final state output.

start_idx = content.find(start_str)

# We need to find the `)}` that matches `{project.telemetryType === "agentic" && (`
if start_idx != -1:
    # Find the start of the next block which is `{project.telemetryType === "flood" && (`
    end_idx = content.find('{project.telemetryType === "flood" && (', start_idx)
    
    if end_idx != -1:
        # We replace everything between start_idx and end_idx
        original_chunk = content[start_idx:end_idx]
        
        new_chunk = """{/* Right Column: Live Visual Architecture Telemetry (5 Cols) */}
          <motion.div style={{ opacity: panelOpacity, y: panelY }} className="lg:col-span-5 w-full bg-black/60 rounded-3xl border border-white/10 p-6 space-y-4 shadow-inner flex flex-col">
            
            {/* Visualizer Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                {project.telemetryType === "agentic" ? (
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                ) : (
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                )}
                <span className="uppercase font-bold tracking-wider">
                  {project.telemetryType === "agentic" ? "PROJECT GALLERY" : "LIVE TELEMETRY WINDOW"}
                </span>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {project.telemetryType === "agentic" ? "INTERACTIVE" : "ACTIVE PIPELINE"}
              </span>
            </div>

            {/* Conditional Graphic Visualizers */}
            {project.telemetryType === "agentic" && (
              <div className="flex-1 w-full flex items-center justify-center min-h-[350px] py-4">
                <InteractivePhotoStack />
              </div>
            )}
            
            """
            
        content = content[:start_idx] + new_chunk + content[end_idx:]
        
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)