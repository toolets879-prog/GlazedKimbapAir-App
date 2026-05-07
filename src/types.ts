export interface Destination {
  id: string;
  city: string;
  country: string;
  code: string;
  image: string;
  timezone: string;
  gate: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  departureTime: string;
  departureTimestamp: number; // For automatic deletion
  arrivalTime: string;
  price: number;
  seats: {
    First: number;
    Business: number;
    Economy: number;
  };
  occupiedSeats: string[];
  userId?: string;
}

export interface Booking {
  id: string;
  flightId: string;
  passengerName: string;
  flightNumber: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  departureTime: string;
  gate: string;
  seat: string;
  class: 'First' | 'Business' | 'Economy';
  bookingCode: string;
  date: string;
  userId?: string;
}
