import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, ChevronRight, MapPin, User, CheckCircle2, Ticket, Clock, Armchair } from 'lucide-react';
import { DESTINATIONS } from '../constants';
import { Booking, Flight } from '../types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

import { format as formatTZ, toZonedTime } from 'date-fns-tz';

interface FlightBookingProps {
  onBookingComplete: (booking: Booking) => void;
  flights: Flight[];
  timezone: string;
}

export default function FlightBooking({ onBookingComplete, flights, timezone }: FlightBookingProps) {
  const [step, setStep] = useState(1);
  const [selectedDestId, setSelectedDestId] = useState<string>('');
  const [selectedFlightId, setSelectedFlightId] = useState<string>('');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [passengerName, setPassengerName] = useState('');
  const [selectedClass, setSelectedClass] = useState<'First' | 'Business' | 'Economy'>('First');

  const selectedDest = DESTINATIONS.find(d => d.id === selectedDestId);
  const destinationFlights = flights.filter(f => f.destinationCode === selectedDest?.code);
  
  // Auto-select first flight when destination changes
  useState(() => {
    if (destinationFlights.length > 0 && !selectedFlightId) {
      setTimeout(() => setSelectedFlightId(destinationFlights[0].id), 0);
    }
  });

  const selectedFlight = flights.find(f => f.id === selectedFlightId) || destinationFlights[0];

  const generateSeats = (cabin: 'First' | 'Business' | 'Economy') => {
    const seats: (string | null)[] = [];
    const config = {
      First: { rows: 4, seatsPerRow: 2, aisleIndex: 1, cols: ['A', 'K'] },
      Business: { rows: 6, seatsPerRow: 4, aisleIndex: 2, cols: ['A', 'B', 'J', 'K'] },
      Economy: { rows: 20, seatsPerRow: 6, aisleIndex: 3, cols: ['A', 'B', 'C', 'H', 'J', 'K'] },
    };

    const c = config[cabin];
    const startRow = cabin === 'First' ? 1 : cabin === 'Business' ? 6 : 15;

    for (let r = 0; r < c.rows; r++) {
      let seatIdxInRow = 0;
      for (let i = 0; i < c.seatsPerRow + 1; i++) {
        if (i === c.aisleIndex) {
          seats.push(null);
        } else {
          seats.push(`${startRow + r}${c.cols[seatIdxInRow]}`);
          seatIdxInRow++;
        }
      }
    }
    return seats;
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const generateBooking = () => {
    if (!selectedDest || !selectedFlight) return;
    
    const booking: Booking = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      flightId: selectedFlight.id,
      passengerName,
      flightNumber: selectedFlight.flightNumber,
      origin: "Seoul Incheon",
      originCode: "ICN",
      destination: selectedDest.city,
      destinationCode: selectedDest.code,
      departureTime: selectedFlight.departureTimestamp 
        ? formatTZ(toZonedTime(new Date(selectedFlight.departureTimestamp), timezone), 'hh:mm a')
        : selectedFlight.departureTime,
      gate: selectedDest.gate,
      seat: selectedSeat || `${Math.floor(Math.random() * 10) + 1}${['A', 'K', 'D'][Math.floor(Math.random() * 3)]}`,
      class: selectedClass,
      bookingCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    onBookingComplete(booking);
  };

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col pt-6 px-4">
      <div className="mb-6 px-2">
        <h2 className="text-3xl font-bold tracking-tight text-primary">Book Your Flight</h2>
        <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] font-black mt-1">GlazedKimpab Air Experience</p>
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
               <div className="space-y-4 px-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Destination</Label>
                <div className="grid gap-3 pb-4">
                  {DESTINATIONS.map((dest) => {
                    const count = flights.filter(f => f.destinationCode === dest.code).length;
                    const isSelected = selectedDestId === dest.id;
                    const hasFlights = count > 0;

                    return (
                      <Card 
                        key={dest.id}
                        id={`dest-${dest.id}`}
                        className={`cursor-pointer transition-all overflow-hidden border-2 rounded-3xl ${isSelected ? 'border-primary bg-primary/5 shadow-xl ring-1 ring-primary' : 'border-transparent bg-muted/20 hover:border-muted-foreground/30'} ${!hasFlights && isSelected ? 'border-destructive ring-destructive shadow-destructive/10' : ''}`}
                        onClick={() => {
                          setSelectedDestId(dest.id);
                          const dFlights = flights.filter(f => f.destinationCode === dest.code);
                          if (dFlights.length > 0) setSelectedFlightId(dFlights[0].id);
                          else setSelectedFlightId('');
                        }}
                      >
                        <CardContent className="p-0 flex items-center h-24">
                          <img 
                            src={dest.image} 
                            alt={dest.city} 
                            className="w-28 h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 px-4 flex justify-between items-center">
                            <div>
                              <p className="font-black text-xl tracking-tight leading-none">{dest.city.toUpperCase()}</p>
                              <p className="text-[10px] text-muted-foreground font-bold mt-1">{dest.country}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-sm font-bold opacity-40">{dest.code}</p>
                              <p className={`text-[10px] font-black uppercase mt-1 ${count > 0 ? 'text-primary' : 'text-destructive'}`}>
                                {count > 0 ? `${count} ${count === 1 ? 'Flight' : 'Flights'}` : 'NO SLOTS'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              <div className="px-2 pb-8">
                {selectedDestId && flights.filter(f => f.destinationCode === DESTINATIONS.find(d => d.id === selectedDestId)?.code).length === 0 && (
                  <p className="text-[10px] text-destructive font-black uppercase tracking-widest text-center mb-4 italic">
                    Network Warning: No active flight schedules for this hub.
                  </p>
                )}
                <Button 
                  disabled={!selectedDestId || flights.filter(f => f.destinationCode === DESTINATIONS.find(d => d.id === selectedDestId)?.code).length === 0} 
                  onClick={handleNext} 
                  className="w-full h-14 text-sm font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
                  id="btn-next-dest"
                >
                  Confirm Selection <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 px-2 pb-10"
            >
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Choose Flight Schedule</Label>
                  <div className="space-y-2">
                    {destinationFlights.map(flight => (
                      <div 
                        key={flight.id}
                        onClick={() => setSelectedFlightId(flight.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${selectedFlightId === flight.id ? 'border-primary bg-primary/5' : 'border-muted bg-muted/10'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Plane className={`w-5 h-5 ${selectedFlightId === flight.id ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div>
                            <p className="font-black text-sm">{flight.flightNumber}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">
                              {flight.departureTimestamp 
                                ? formatTZ(toZonedTime(new Date(flight.departureTimestamp), timezone), 'hh:mm a')
                                : flight.departureTime} • Nonstop
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 text-secondary">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-black italic">ON TIME</span>
                          </div>
                          <div className="mt-1 flex flex-col items-end">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">
                              {flight.seats.First + flight.seats.Business + flight.seats.Economy} SEATS
                            </p>
                            <p className="text-[7px] font-black text-primary uppercase">Capacity Available</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passenger-name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Passenger Information</Label>
                  <Input 
                    id="passenger-name" 
                    placeholder="ENTER FULL NAME" 
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    className="h-14 bg-muted/20 border-muted focus:ring-primary font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cabin Class</Label>
                    {selectedFlight && (
                      <p className="text-[9px] font-black uppercase text-primary">
                        {selectedFlight.seats[selectedClass]} Seats Remaining
                      </p>
                    )}
                  </div>
                  <Select value={selectedClass} onValueChange={(val: any) => setSelectedClass(val)}>
                    <SelectTrigger className="h-14 bg-muted/20 border-muted font-bold">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First" disabled={selectedFlight?.seats.First === 0}>
                        First Class ({selectedFlight?.seats.First} left)
                      </SelectItem>
                      <SelectItem value="Business" disabled={selectedFlight?.seats.Business === 0}>
                        Business Suite ({selectedFlight?.seats.Business} left)
                      </SelectItem>
                      <SelectItem value="Economy" disabled={selectedFlight?.seats.Economy === 0}>
                        Economy Executive ({selectedFlight?.seats.Economy} left)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card className="glass border-primary/20 rounded-3xl overflow-hidden mt-4">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-center opacity-40">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-black uppercase">ICN</span>
                      </div>
                      <div className="flex-1 border-t-2 border-dashed border-muted-foreground/30 mx-4" />
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-black uppercase">{selectedDest?.code}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Network Fee</p>
                        <p className="text-3xl font-black text-secondary leading-none italic uppercase">Complimentary</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground font-black uppercase">Service</p>
                        <p className="font-bold text-sm">SIM-CONNECT</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleBack} className="flex-1 h-14 border-2 uppercase text-xs font-black tracking-widest rounded-2xl">Back</Button>
                <Button 
                  disabled={!passengerName || !selectedFlightId} 
                  onClick={handleNext} 
                  className="flex-[2] h-14 text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20"
                  id="btn-confirm-details"
                >
                  Verify Booking
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 px-2 flex flex-col h-full overflow-hidden"
            >
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Priority Selection</Label>
                <h3 className="text-xl font-black italic uppercase tracking-tighter leading-tight">Select your {selectedClass} Class Seat</h3>
              </div>
              
              <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="py-4">
                  <div className={`grid gap-2 max-w-[320px] mx-auto ${
                    selectedClass === 'First' ? 'grid-cols-3' : 
                    selectedClass === 'Business' ? 'grid-cols-5' : 
                    'grid-cols-7'
                  }`}>
                    {generateSeats(selectedClass).map((seat, idx) => {
                      if (seat === null) {
                        return <div key={`aisle-${idx}`} className="flex items-center justify-center pointer-events-none">
                          <div className="w-[2px] h-full bg-white/5 mx-auto" />
                        </div>;
                      }
                      
                      const isOccupied = selectedFlight?.occupiedSeats.includes(seat);
                      const isSelected = selectedSeat === seat;
                      
                      return (
                        <motion.div 
                          key={seat}
                          whileHover={!isOccupied ? { scale: 1.15, y: -2, zIndex: 20 } : {}}
                          whileTap={!isOccupied ? { scale: 0.9 } : {}}
                          animate={{
                            scale: isSelected ? 1.1 : 1,
                          }}
                          onClick={() => !isOccupied && setSelectedSeat(seat)}
                          className={`
                            h-10 rounded-lg flex items-center justify-center text-[10px] font-black transition-all cursor-pointer relative
                            ${isOccupied ? 'bg-muted/10 text-muted-foreground/30 cursor-not-allowed opacity-20' : 
                              isSelected ? 'text-white z-10' : 
                              'bg-muted/30 text-muted-foreground hover:bg-muted font-bold'}
                          `}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="seat-highlight"
                              className="absolute inset-0 bg-primary rounded-lg -z-10 shadow-lg shadow-primary/40 ring-2 ring-primary ring-offset-2 ring-offset-background"
                              initial={false}
                              transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                            />
                          )}
                          {seat}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-8 space-y-4 px-4 pb-8">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-primary" />
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-muted/30" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-muted/10 opacity-20" />
                      <span>Occupied</span>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex gap-3 pt-4 pb-8 mt-auto">
                <Button variant="outline" onClick={handleBack} className="flex-1 h-14 border-2 uppercase text-xs font-black tracking-widest rounded-2xl">Back</Button>
                <Button 
                  disabled={!selectedSeat} 
                  onClick={handleNext} 
                  className="flex-[2] h-14 text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20"
                  id="btn-confirm-seat"
                >
                  Confirm Seat {selectedSeat && `(${selectedSeat})`}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center space-y-8 py-10"
            >
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 100 }}
                  className="w-28 h-28 bg-secondary rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl shadow-secondary/40"
                >
                  <CheckCircle2 className="w-14 h-14 text-white" />
                </motion.div>
                <motion.div 
                  className="absolute -inset-6 border-2 border-secondary/30 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>

              <div className="text-center space-y-3 px-6">
                <h3 className="text-3xl font-black tracking-tighter italic uppercase">Cleared for Departure</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed uppercase tracking-tight">Your premium flight simulation slot has been issued. Prepare your cockpit for GK Network entry.</p>
              </div>

              <div className="w-full px-4">
                <Button 
                  onClick={generateBooking} 
                  className="w-full h-16 text-lg font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 rounded-2xl"
                  id="btn-generate-pass"
                >
                  <Ticket className="mr-3 w-7 h-7" /> Access Boarding Pass
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

