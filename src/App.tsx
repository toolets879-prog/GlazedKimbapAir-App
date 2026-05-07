import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, MapPin, Search, User, Home, UserCircle, Globe, ChevronRight, Calculator, Briefcase, Shield, LogOut, LogIn, Youtube } from 'lucide-react';
import FlightBooking from './components/FlightBooking';
import BoardingPass from './components/BoardingPass';
import PilotPortal from './components/PilotPortal';
import { FleetView } from './components/FleetView';
import { Booking, Flight } from './types';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { ScrollArea } from './components/ui/scroll-area';
import { MOCK_FLIGHTS } from './constants';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { 
  collection as firestoreCollection,
  onSnapshot as firestoreOnSnapshot,
  query as firestoreQuery,
  doc as firestoreDoc,
  addDoc as firestoreAddDoc,
  updateDoc as firestoreUpdateDoc,
  deleteDoc as firestoreDeleteDoc,
  increment as firestoreIncrement,
  arrayUnion as firestoreArrayUnion,
  getDocFromServer as firestoreGetDocFromServer
} from 'firebase/firestore';
import { format as formatTZ, toZonedTime } from 'date-fns-tz';

type ViewSate = 'home' | 'booking' | 'pass' | 'pilot' | 'fleet';

const OFFSETS = Array.from({ length: 27 }, (_, i) => i - 12).map(offset => {
  const label = offset >= 0 ? `+${offset}` : `${offset}`;
  // Etc/GMT signs are famously inverted (+1 is Etc/GMT-1)
  const value = offset === 0 ? 'UTC' : `Etc/GMT${offset > 0 ? '-' : '+'}${Math.abs(offset)}`;
  return { label, value };
});

export default function App() {
  const [view, setView] = useState<ViewSate>('home');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [timezone, setTimezone] = useState('UTC');

  useEffect(() => {
    // Test Firestore connection
    const testConn = async () => {
      try {
        await firestoreGetDocFromServer(firestoreDoc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Firestore is offline. Check Firebase config.");
        }
      }
    };
    testConn();
  }, []);

  useEffect(() => {
    const q = firestoreQuery(firestoreCollection(db, 'flights'));
    const unsubscribe = firestoreOnSnapshot(q, (snapshot) => {
      const now = Date.now();
      const validFlights: Flight[] = [];
      const expiredFlightIds: string[] = [];

      snapshot.docs.forEach((snapDoc) => {
        const data = snapDoc.data() as Flight;
        const flightId = snapDoc.id;

        if (data.departureTimestamp && data.departureTimestamp < now) {
          expiredFlightIds.push(flightId);
        } else {
          validFlights.push({ id: flightId, ...data });
        }
      });

      // Update state with valid flights immediately
      setFlights(validFlights.length > 0 ? validFlights : MOCK_FLIGHTS.map(f => ({ ...f, userId: 'system', departureTimestamp: Date.now() + 3600000 })));

      // Perform deletions in the background
      expiredFlightIds.forEach(async (id) => {
        try {
          await firestoreDeleteDoc(firestoreDoc(db, 'flights', id));
          console.log(`Auto-deleted expired flight: ${id}`);
        } catch (e) {
          // System cleanup, silent fail or log
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'flights');
    });
    return () => unsubscribe();
  }, []);

  const handleBookingComplete = async (booking: Booking) => {
    const path = 'bookings';
    try {
      // Save booking to Firestore
      await firestoreAddDoc(firestoreCollection(db, path), {
        ...booking,
        userId: 'guest'
      });

      // Update flight in Firestore
      const flightRef = firestoreDoc(db, 'flights', booking.flightId);
      await firestoreUpdateDoc(flightRef, {
        [`seats.${booking.class}`]: firestoreIncrement(-1),
        occupiedSeats: firestoreArrayUnion(booking.seat)
      });

      setCurrentBooking(booking);
      setView('pass');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleAddFlight = async (newFlight: Flight) => {
    const path = 'flights';
    try {
      await firestoreAddDoc(firestoreCollection(db, path), {
        ...newFlight,
        userId: 'pilot'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleDeleteFlight = async (flightId: string) => {
    const path = `flights/${flightId}`;
    try {
      await firestoreDeleteDoc(firestoreDoc(db, 'flights', flightId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const resetAll = () => {
    setCurrentBooking(null);
    setView('home');
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground overflow-hidden flex flex-col">
      {/* Mobile-style View Container */}
      <div className="flex-1 w-full max-w-md mx-auto relative flex flex-col bg-card shadow-2xl min-h-screen border-x">
        
        {/* Animated Views */}
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Hero / Home Header */}
              <div className="relative h-64 overflow-hidden rounded-b-[3rem]">
                <img 
                  src="https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?q=80&w=1200&auto=format&fit=crop" 
                  alt="GlazedKimpab Air" 
                  className="w-full h-full object-cover grayscale-[0.2]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                
                <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2">
                    {/* Timezone Selector */}
                    <div className="bg-black/60 backdrop-blur-md rounded-full border border-white/20 p-1 flex items-center gap-1 shadow-lg">
                      <Globe className="w-3 h-3 ml-2 text-primary" />
                      <select 
                        value={timezone} 
                        onChange={(e) => setTimezone(e.target.value)}
                        className="bg-transparent text-white text-[10px] font-black uppercase px-2 py-1 outline-none cursor-pointer tracking-widest"
                      >
                        {OFFSETS.map(tz => (
                          <option key={tz.value} value={tz.value} className="bg-zinc-900">
                            {tz.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <a 
                      href="https://discord.gg/PJdCnnufRB" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 border-white/10 backdrop-blur-md text-white border hover:bg-black/40 transition-colors"
                      title="Join our Discord"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://youtube.com/@glazedkimpabair?si=zfJV7qAeYpL_meI5" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 border-white/10 backdrop-blur-md text-white border hover:bg-black/40 transition-colors"
                      title="Follow us on YouTube"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                <div className="absolute bottom-10 left-8 right-8">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">GLAZED<br/>KIMPAB AIR</h1>
                    <p className="text-xs uppercase font-bold tracking-[0.3em] text-primary mt-2">Simulated First Class Journey</p>
                  </motion.div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="px-6 py-8 space-y-8 flex-1 overflow-y-auto">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Departures</h3>
                  <div className="p-6 rounded-3xl bg-primary shadow-xl shadow-primary/20 relative overflow-hidden group cursor-pointer" onClick={() => setView('booking')}>
                    <div className="relative z-10 flex justify-between items-center text-black">
                      <div>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Next Flight ICN</p>
                        <p className="text-2xl font-black">SEOUL TO WORLD</p>
                        <p className="text-xs font-medium mt-1 uppercase tracking-tight">Personalized Sim Itinerary</p>
                      </div>
                      <div className="bg-black text-white p-3 rounded-full group-hover:scale-110 transition-transform shadow-lg shadow-black/20">
                        <ChevronRight className="w-6 h-6" />
                      </div>
                    </div>
                    {/* Abstract turbine shape in background */}
                    <Plane className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-45 text-black" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div 
                    className="p-5 rounded-2xl bg-muted/30 border border-muted flex flex-col gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setView('pilot')}
                   >
                     <Shield className="w-6 h-6 text-primary" />
                     <p className="text-xs font-black uppercase tracking-tight leading-tight">Pilot Portal</p>
                     <p className="text-[10px] text-muted-foreground uppercase">Command Access</p>
                   </div>
                   <div 
                     className="p-5 rounded-2xl bg-muted/30 border border-muted flex flex-col gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
                     onClick={() => setView('fleet')}
                   >
                     <Briefcase className="w-6 h-6 text-primary" />
                     <p className="text-xs font-black uppercase tracking-tight leading-tight">Fleet Log</p>
                     <p className="text-[10px] text-muted-foreground uppercase">Simulation Info</p>
                   </div>
                </div>

                <Card className="border-none bg-secondary/10 p-6 rounded-3xl">
                  <div className="flex gap-4 text-secondary">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0 shadow-lg shadow-secondary/20">
                      <Globe className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg leading-tight uppercase tracking-tight">Global Network</p>
                      <p className="text-xs text-muted-foreground mt-1">Fly to premium destinations across 4 continents. All flights from Seoul (ICN) are completely free for simulate enthusiasts.</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Tab Bar (Pseudo) */}
              <div className="h-20 border-t flex items-center justify-around px-6 bg-card/80 backdrop-blur-lg mt-auto shrink-0">
                <Button variant="ghost" className="flex flex-col gap-1 p-0 h-auto text-primary" onClick={resetAll}>
                  <Home className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Home</span>
                </Button>
                <Button variant="ghost" className="flex flex-col gap-1 p-0 h-auto text-muted-foreground" onClick={() => setView('booking')}>
                  <Search className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Search</span>
                </Button>
                <Button variant="ghost" className="flex flex-col gap-1 p-0 h-auto text-muted-foreground" onClick={() => setView('pilot')}>
                  <Shield className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Pilot</span>
                </Button>
              </div>
            </motion.div>
          )}

          {view === 'booking' && (
            <motion.div
              key="booking"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 bg-background"
            >
              <div className="p-4 border-b flex items-center bg-card">
                <Button variant="ghost" onClick={resetAll} className="mr-4">
                  Back
                </Button>
                <div className="flex-1">
                   <span className="font-bold uppercase tracking-widest text-sm">New Journey</span>
                </div>
              </div>
              <FlightBooking 
                onBookingComplete={handleBookingComplete} 
                flights={flights} 
                timezone={timezone}
              />
            </motion.div>
          )}

          {view === 'pilot' && (
            <motion.div
              key="pilot"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="flex-1 bg-background z-50 flex flex-col"
            >
               <PilotPortal 
                  onAddFlight={handleAddFlight} 
                  onDeleteFlight={handleDeleteFlight}
                  onExit={resetAll} 
                  timezone={timezone}
                  flights={flights}
               />
            </motion.div>
          )}

          {view === 'fleet' && (
            <motion.div
              key="fleet"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="flex-1 bg-background z-50 flex flex-col"
            >
               <FleetView onExit={resetAll} />
            </motion.div>
          )}

          {view === 'pass' && currentBooking && (
            <motion.div
              key="pass"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-background flex flex-col"
            >
              <BoardingPass 
                booking={currentBooking} 
                onReset={resetAll} 
                timezone={timezone}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

