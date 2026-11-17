export type Role = "USER" | "ADMIN";

export type TheatreType = "MULTIPLEX" | "THEATRE";

export type SeatType = "LUXURY" | "PLATINUM" | "GOLD" | "SILVER" | "FRONT";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface User {
  id: number;
  email: string;
  name?: string | null;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  type: TheatreType;
  totalSeats: number;
  totalScreens: number;
  createdAt?: string;
  updatedAt?: string;
  events?: Event[];
  seats?: Seat[];
}

export interface Seat {
  id: number;
  seatNumber: string;
  row: string;
  type: SeatType;
  venueId: number;
}

export interface Event {
  id: number;
  title: string;
  description?: string | null;
  releaseDate?: string | null;
  poster?: string | null;
  rating?: number | null;
  venueId: number;
  venue?: Venue;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: number;
  status: BookingStatus;
  totalAmount: number;
  bookingReference?: string | null;
  isScanned?: boolean;
  scannedAt?: string | null;
  userId: number;
  eventId: number;
  seatId: number;
  createdAt: string;
  updatedAt?: string;
  event?: Event;
  seat?: Seat;
  user?: Partial<User>;
}

export interface BookedSeatItem {
  seatId: number;
  status: BookingStatus;
  seat: {
    seatNumber: string;
    row: string;
    type: SeatType;
  };
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
}

export interface PublicTicketPass {
  message: string;
  bookingReference: string;
  event: Event;
  user?: { name?: string | null; email?: string };
  status: BookingStatus;
  totalAmount: number;
  seats: Array<{
    id: number;
    seatId: number;
    seatNumber: string;
    row: string;
    type: SeatType;
    price: number;
    isScanned?: boolean;
    scannedAt?: string | null;
  }>;
  createdAt: string;
}
