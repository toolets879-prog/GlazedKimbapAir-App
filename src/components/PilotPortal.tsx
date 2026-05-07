import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, PlaneTakeoff, Plus, ChevronLeft, LogOut, CheckCircle2, Clock, Lock, Key, Trash2, Globe, Plane } from 'lucide-react';
import { format, parse, addMinutes } from 'date-fns';
import { DESTINATIONS } from '../constants';
import { Flight } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

import { format as formatTZ, toZonedTime } from 'date-fns-tz';

interface PilotPortalProps {
  onAddFlight: (flight: Flight) => void;
  onDeleteFlight: (flightId: string) => void;
  onExit: () => void;
  timezone: string;
  flights: Flight[];
}

// Estimated durations from Seoul (ICN) in minutes
const FLIGHT_DURATIONS: Record<string, number> = {
  HKG: 240,  // 4h
  JFK: 840,  // 14h
  SIN: 390,  // 6.5h
  DXB: 600,  // 10h
  PRG: 720,  // 12h
  LHR: 780,  // 13h
};

export default function PilotPortal({ onAddFlight, onDeleteFlight, onExit, timezone, flights }: PilotPortalProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('create');

  // Form State
  const [flightNumber, setFlightNumber] = useState('GK' + (Math.floor(Math.random() * 899) + 100));
  const [destCode, setDestCode] = useState('');
  const [departure, setDeparture] = useState(formatTZ(toZonedTime(new Date(), timezone), 'hh:mm a'));
  const [arrival, setArrival] = useState('');
  const [seatsFirst, setSeatsFirst] = useState('8');
  const [seatsBusiness, setSeatsBusiness] = useState('24');
  const [seatsEconomy, setSeatsEconomy] = useState('120');
  const [flightDuration, setFlightDuration] = useState('300');
  const [lastCreatedFlight, setLastCreatedFlight] = useState<Flight | null>(null);

  // Sync duration with selected destination
  useEffect(() => {
    if (destCode && FLIGHT_DURATIONS[destCode]) {
      setFlightDuration(FLIGHT_DURATIONS[destCode].toString());
    }
  }, [destCode]);

  // Auto-calculate arrival whenever departure, destination, or duration changes
  useEffect(() => {
    if (!destCode || !departure) return;

    try {
      const destination = DESTINATIONS.find(d => d.code === destCode);
      if (!destination) return;

      // 1. Parse departure time string (Assumed today, UTC)
      const baseDate = toZonedTime(new Date(), 'UTC');
      const depDate = parse(departure.toUpperCase(), 'hh:mm a', baseDate);
      
      // 2. Add duration from state
      const durationVal = parseInt(flightDuration) || 0;
      let arrivalDate = addMinutes(depDate, durationVal);

      // 3. Adjust for destination timezone relative to UTC
      const targetOffset = parseInt(destination.timezone.replace('GMT', '')) || 0;
      arrivalDate = addMinutes(arrivalDate, targetOffset * 60);

      // 4. Format arrival string (Destination Local Time)
      setArrival(format(arrivalDate, 'hh:mm a'));
    } catch (e) {
      console.error("Time calculation error", e);
    }
  }, [destCode, departure, flightDuration]);

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Analyzing code:", authCode.trim().toLowerCase());
    if (authCode.trim().toLowerCase() === 'kimbap') {
      setIsAuthorized(true);
      setAuthError('');
    } else {
      setAuthError('Unauthorized command code.');
    }
  };

  const handleCreateFlight = (e: React.FormEvent) => {
    e.preventDefault();
    const destination = DESTINATIONS.find(d => d.code === destCode);
    if (!destination) return;

    // Calculate timestamp (parsed as UTC)
    const baseDate = toZonedTime(new Date(), 'UTC');
    const depDate = parse(departure.toUpperCase(), 'hh:mm a', baseDate);
    const departureTimestamp = depDate.getTime();

    const newFlight: any = {
      flightNumber: flightNumber.toUpperCase(),
      origin: "Seoul",
      originCode: "ICN",
      destination: destination.city,
      destinationCode: destination.code,
      departureTime: departure,
      departureTimestamp,
      arrivalTime: arrival,
      price: 0,
      seats: {
        First: parseInt(seatsFirst) || 0,
        Business: parseInt(seatsBusiness) || 0,
        Economy: parseInt(seatsEconomy) || 0,
      },
      occupiedSeats: [],
    };

    onAddFlight(newFlight);
    setLastCreatedFlight({ ...newFlight, id: 'pending' });
    
    // Reset form partially for next time
    setFlightNumber('GK' + (Math.floor(Math.random() * 899) + 100));
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setLastCreatedFlight(null);
    setDestCode('');
  };

  if (!isAuthorized) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-950 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-8 text-center"
        >
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-x-0 bottom-0 top-0 bg-primary/20 blur-2xl rounded-full" />
            <div className="relative w-24 h-24 bg-zinc-900 border-2 border-primary/30 rounded-3xl flex items-center justify-center">
              <Lock className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Secure Access</h2>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] italic">Command: kimbap</p>
          </div>

          <form onSubmit={handleAuthorize} className="space-y-4">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70 block text-left ml-4">Pilot Code (Hint: kimbap)</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter Code"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  className="h-16 bg-white/5 border-white/10 text-center text-xl tracking-[0.2em] font-mono rounded-2xl focus:ring-primary focus:border-primary border-2 uppercase"
                  autoFocus
                />
                <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-30" />
              </div>
              {authError && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-primary text-[10px] font-black uppercase italic"
                >
                  {authError}
                </motion.p>
              )}
            </div>
            
            <Button type="submit" className="w-full h-16 text-lg font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20">
              Unlock Terminal
            </Button>
          </form>

          <Button variant="ghost" onClick={onExit} className="text-muted-foreground hover:text-white uppercase text-[10px] font-black tracking-widest italic pt-4">
             Cancel Authorization
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-white overflow-hidden">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center border border-secondary/40">
            <ShieldCheck className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Verified Pilot</p>
            <p className="text-lg font-black tracking-tighter italic leading-none">Command Center</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onExit} className="rounded-xl border border-white/5">
          <LogOut className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-sm mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-900 border border-white/10 rounded-2xl p-1 h-12 shadow-inner">
              <TabsTrigger value="create" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black uppercase text-[10px] font-black tracking-widest transition-all">Schedule</TabsTrigger>
              <TabsTrigger value="manage" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black uppercase text-[10px] font-black tracking-widest transition-all">Manage</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-0 outline-none">
              <AnimatePresence mode="wait">
                {!lastCreatedFlight ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">Fleet Status</p>
                        <p className="text-xl font-black mt-1 italic">OPERATIONAL</p>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">Auth Level</p>
                        <p className="text-xl font-black mt-1 italic">CAPTAIN</p>
                      </div>
                    </div>

                    <form onSubmit={handleCreateFlight} className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Mission Ident</Label>
                        <Input
                          value={flightNumber}
                          onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                          className="h-14 bg-white/5 border-white/10 font-mono text-xl font-black italic tracking-wider rounded-2xl text-white"
                          placeholder="e.g. GK777"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Target Sector</Label>
                        <Select value={destCode} onValueChange={setDestCode}>
                          <SelectTrigger className="h-14 bg-white/5 border-white/10 font-black italic text-lg rounded-2xl text-white">
                            <SelectValue placeholder="Select Destination" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-white/10">
                            {DESTINATIONS.map((dest) => (
                              <SelectItem key={dest.code} value={dest.code} className="font-bold text-white">
                                {dest.city} ({dest.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Duration (Minutes)</Label>
                        <Input
                          type="number"
                          value={flightDuration}
                          onChange={(e) => setFlightDuration(e.target.value)}
                          className="h-14 bg-white/5 border-white/10 font-bold text-lg rounded-2xl text-white"
                          placeholder="e.g. 240"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Dep. Time (UTC)</Label>
                          <Input
                            value={departure}
                            onChange={(e) => setDeparture(e.target.value)}
                            className="h-14 bg-white/5 border-white/10 font-mono font-bold text-center rounded-2xl text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-1 ml-2">
                            Arr. Local <Clock className="w-3 h-3" />
                          </Label>
                          <Input
                            value={arrival}
                            readOnly
                            className="h-14 bg-primary/5 border-primary/20 text-primary font-mono font-bold text-center rounded-2xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                           <p className="text-[8px] font-black uppercase text-primary/60 text-center">First</p>
                           <Input value={seatsFirst} onChange={e => setSeatsFirst(e.target.value)} className="h-10 bg-white/5 border-white/10 text-center font-black rounded-xl text-white" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[8px] font-black uppercase text-primary/60 text-center">Business</p>
                           <Input value={seatsBusiness} onChange={e => setSeatsBusiness(e.target.value)} className="h-10 bg-white/5 border-white/10 text-center font-black rounded-xl text-white" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[8px] font-black uppercase text-primary/60 text-center">Economy</p>
                           <Input value={seatsEconomy} onChange={e => setSeatsEconomy(e.target.value)} className="h-10 bg-white/5 border-white/10 text-center font-black rounded-xl text-white" />
                        </div>
                      </div>

                      <Button type="submit" className="w-full h-16 bg-primary text-black font-black uppercase tracking-[0.4em] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-98 transition-all italic">
                        <Plus className="w-6 h-6 mr-2" /> Dispatch Mission
                      </Button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 border border-primary/40">
                      <CheckCircle2 className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-3xl font-black italic uppercase mb-2 tracking-tighter">Transmission Successful</h3>
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-8">Mission ident {lastCreatedFlight.flightNumber} is now live.</p>
                    <Button onClick={() => setLastCreatedFlight(null)} className="rounded-full px-10 h-14 uppercase font-black tracking-[0.2em] text-[10px] shadow-lg shadow-primary/10">
                      Register Next Mission
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="manage" className="mt-0 outline-none">
               <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Global Fleet Roster</h3>
                    <span className="text-[8px] font-black uppercase bg-primary text-black px-2 py-0.5 rounded-full shadow-lg shadow-primary/20">{flights.filter(f => f.userId !== 'system').length} ACTIVE</span>
                  </div>

                  <div className="space-y-3">
                    {flights.filter(f => f.userId !== 'system').map(flight => (
                      <div key={flight.id} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all border-l-primary/40 border-l-2">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary">
                             <Plane className="w-6 h-6" />
                          </div>
                          <div>
                             <div className="flex items-center gap-2">
                                <span className="font-black italic text-xl tracking-tighter">{flight.flightNumber}</span>
                                <span className="text-[9px] font-black uppercase text-muted-foreground px-2 py-0.5 border border-white/20 rounded-md">ICN → {flight.destinationCode}</span>
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest">
                                <Clock className="w-3 h-3" /> DEP UTC {flight.departureTime}
                             </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => flight.id && onDeleteFlight(flight.id)}
                          className="text-red-500/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl h-12 w-12 transition-all"
                        >
                           <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    ))}
                    
                    {flights.filter(f => f.userId !== 'system').length === 0 && (
                      <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[2rem] opacity-30">
                         <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                         <p className="text-[10px] font-black uppercase tracking-[0.3em]">No custom sectors active in matrix</p>
                      </div>
                    )}
                  </div>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
      <div className="p-6 bg-zinc-900 border-t border-white/5">
        <Button variant="ghost" onClick={onExit} className="w-full text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
           Return to Main Hub
        </Button>
      </div>
    </div>
  );
}
