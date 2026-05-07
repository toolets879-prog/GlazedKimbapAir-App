import { motion } from 'motion/react';
import { Download, Share2, MapPin, Plane, User, Calendar, Clock, QrCode } from 'lucide-react';
import { format, parse, addMinutes } from 'date-fns';
import { Booking } from '../types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';

interface BoardingPassProps {
  booking: Booking;
  onReset: () => void;
  timezone?: string;
}

export default function BoardingPass({ booking, onReset, timezone }: BoardingPassProps) {
  // Rough boarding time calculation (30 mins before)
  const getBoardingTime = () => {
    try {
      const depDate = parse(booking.departureTime.toUpperCase(), 'hh:mm a', new Date());
      const boardDate = addMinutes(depDate, -30);
      return format(boardDate, 'hh:mm a');
    } catch (e) {
      return "09:45 AM";
    }
  };
  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col pt-6 px-4 pb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black tracking-tighter text-primary">BOARDING PASS</h2>
        <Button variant="ghost" size="icon" onClick={onReset} className="rounded-full">
           <Share2 className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1"
      >
        <Card className="rounded-[2rem] overflow-hidden border-none shadow-2xl bg-white dark:bg-zinc-900 border-2 border-primary/20">
          {/* Top Section - Brand & Destination Image (Simplified with color gradient for performance/aesthetic) */}
          <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Airline</p>
                <h3 className="text-lg font-black tracking-tighter italic">GlazedKimpab Air</h3>
              </div>
              <Plane className="w-8 h-8 opacity-40 rotate-45" />
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="text-center flex-1">
                <p className="text-[40px] font-black leading-none">{booking.originCode}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1">SEOUL</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-[1px] bg-white/40 mb-1" />
                <Plane className="w-4 h-4 rotate-90" />
                <div className="w-12 h-[1px] bg-white/40 mt-1" />
              </div>
              <div className="text-center flex-1">
                <p className="text-[40px] font-black leading-none">{booking.destinationCode}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1">{booking.destination.toUpperCase()}</p>
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            {/* Passenger Info */}
            <div className="p-6 grid grid-cols-2 gap-y-4">
              <div className="col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Passenger</p>
                <p className="text-lg font-bold leading-none">{booking.passengerName}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Flight</p>
                <p className="font-bold">{booking.flightNumber}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Class</p>
                <p className="font-bold text-primary">{booking.class}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Date</p>
                <p className="font-bold">{booking.date}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Gate</p>
                <p className="font-bold">{booking.gate}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Boarding</p>
                <p className="font-bold">{getBoardingTime()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Pass TZ</p>
                <p className="font-bold text-[10px]">{timezone || 'UTC'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Seat</p>
                <p className="font-bold text-secondary text-xl">{booking.seat}</p>
              </div>
            </div>

            {/* Perforated Divider */}
            <div className="relative h-4 flex items-center">
              <div className="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-r" />
              <Separator className="border-dashed border-muted flex-1 mx-4" />
              <div className="absolute right-0 translate-x-1/2 w-4 h-4 rounded-full bg-background border-l" />
            </div>

            {/* Bottom Barcode Section */}
            <div className="p-8 flex flex-col items-center gap-4">
               <div className="p-4 bg-muted/40 rounded-2xl">
                 <QrCode className="w-32 h-32 opacity-80" />
               </div>
               <div className="text-center">
                 <p className="text-[10px] font-mono tracking-[0.5em] text-muted-foreground">{booking.bookingCode}</p>
                 <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase">GlazedKimpab Sim Pass ID: {booking.id}</p>
               </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={onReset} className="h-12 uppercase tracking-wide font-bold">
           New Journey
        </Button>
        <Button className="h-12 uppercase tracking-wide font-bold shadow-lg shadow-primary/20">
           <Download className="mr-2 w-4 h-4" /> Save Pass
        </Button>
      </div>

      <p className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-8 opacity-40">
        Flight Simulator Exclusive • Non-Transferable Free Fare
      </p>
    </div>
  );
}
