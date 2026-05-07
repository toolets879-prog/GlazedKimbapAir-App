import { Destination, Flight } from "./types";

export const DESTINATIONS: Destination[] = [
  {
    id: "hkg",
    city: "Hong Kong",
    country: "China",
    code: "HKG",
    image: "https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?q=80&w=800&auto=format&fit=crop",
    timezone: "GMT+8",
    gate: "A12",
  },
  {
    id: "jfk",
    city: "New York",
    country: "USA",
    code: "JFK",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop",
    timezone: "GMT-5",
    gate: "B07",
  },
  {
    id: "sin",
    city: "Singapore",
    country: "Singapore",
    code: "SIN",
    image: "https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=800&auto=format&fit=crop",
    timezone: "GMT+8",
    gate: "C22",
  },
  {
    id: "dxb",
    city: "Dubai",
    country: "UAE",
    code: "DXB",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop",
    timezone: "GMT+4",
    gate: "D15",
  },
  {
    id: "prg",
    city: "Prague",
    country: "Czech Republic",
    code: "PRG",
    image: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=800&auto=format&fit=crop",
    timezone: "GMT+1",
    gate: "E04",
  },
  {
    id: "lhr",
    city: "London",
    country: "UK",
    code: "LHR",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop",
    timezone: "GMT+0",
    gate: "F09",
  }
];

export const FLEET = [
  { model: "Airbus A320-200", manufacturer: "Airbus", type: "Narrow-body" },
  { model: "Airbus A320neo", manufacturer: "Airbus", type: "Narrow-body" },
  { model: "Airbus A330-900", manufacturer: "Airbus", type: "Wide-body" },
  { model: "Airbus A340-300", manufacturer: "Airbus", type: "Wide-body" },
  { model: "Airbus A350-1000", manufacturer: "Airbus", type: "Wide-body" },
  { model: "Airbus A380-800", manufacturer: "Airbus", type: "Wide-body" },
  { model: "ATR-72-600", manufacturer: "ATR", type: "Turboprop" },
  { model: "Boeing 737 Max 8", manufacturer: "Boeing", type: "Narrow-body" },
  { model: "Boeing 747-200", manufacturer: "Boeing", type: "Wide-body" },
  { model: "Boeing 747-400", manufacturer: "Boeing", type: "Wide-body" },
  { model: "Boeing 757-300", manufacturer: "Boeing", type: "Narrow-body" },
  { model: "Boeing 767-300ER", manufacturer: "Boeing", type: "Wide-body" },
  { model: "Boeing 767-400ER", manufacturer: "Boeing", type: "Wide-body" },
  { model: "Boeing 777-300ER", manufacturer: "Boeing", type: "Wide-body" },
  { model: "Boeing 777-9X", manufacturer: "Boeing", type: "Wide-body" },
  { model: "Boeing 787-9", manufacturer: "Boeing", type: "Wide-body" },
  { model: "McDonnel Douglas MD-11", manufacturer: "McDonnel Douglas", type: "Wide-body" },
  { model: "McDonnel Douglas DC-10-30", manufacturer: "McDonnel Douglas", type: "Wide-body" },
  { model: "Lockheed L-1011-1 Tristar", manufacturer: "Lockheed", type: "Wide-body" },
];

export const MOCK_FLIGHTS: Flight[] = [];
