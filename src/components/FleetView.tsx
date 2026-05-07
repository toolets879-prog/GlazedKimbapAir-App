import React from 'react';
import { motion } from 'motion/react';
import { Plane, ChevronRight, Hash, Info, Factory } from 'lucide-react';
import { FLEET } from '../constants';
import { Button } from './ui/button';

interface FleetViewProps {
  onExit: () => void;
}

export function FleetView({ onExit }: FleetViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 bg-black flex flex-col"
    >
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-950">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Global Fleet</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Registered Assets & Specifications</p>
        </div>
        <Button 
          onClick={onExit}
          variant="outline"
          className="rounded-full border-white/10 hover:bg-white/5 uppercase text-[10px] font-black tracking-widest px-6"
        >
          Exit Hangar
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto bg-black">
        <div className="p-6 max-w-4xl mx-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FLEET.map((aircraft, index) => (
              <motion.div
                key={aircraft.model}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative overflow-hidden bg-zinc-900/50 border border-white/5 p-5 rounded-2xl hover:bg-zinc-800/80 transition-all cursor-crosshair"
              >
                {/* Background Accent */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <Plane className="w-24 h-24 rotate-45" />
                </div>

                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-4 w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                        <Plane className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-black italic text-lg text-white leading-tight">{aircraft.model}</h3>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{aircraft.manufacturer}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <Factory className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[8px] font-black uppercase text-muted-foreground">Division</span>
                        </div>
                        <p className="text-[10px] font-black text-white italic">{aircraft.manufacturer}</p>
                      </div>
                      <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <Info className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[8px] font-black uppercase text-muted-foreground">Class</span>
                        </div>
                        <p className="text-[10px] font-black text-white italic">{aircraft.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3 text-primary/60" />
                          <span className="text-[10px] font-mono font-bold text-white tracking-widest">ID-{(index + 1).toString().padStart(3, '0')}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
                
                {/* Visual scanner effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </motion.div>
            ))}
          </div>

          <div className="py-12 text-center">
             <div className="w-12 h-[1px] bg-white/10 mx-auto mb-4" />
             <p className="text-[8px] font-black uppercase tracking-[0.5em] text-muted-foreground">End of Roster — GlazedKimpab Air Operations</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
