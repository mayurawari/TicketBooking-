import { SeatType } from "./types";

export const SEAT_PRICING: Record<SeatType, number> = {
  LUXURY: 500,
  PLATINUM: 350,
  GOLD: 250,
  SILVER: 180,
  FRONT: 120,
};

export const SEAT_COLORS: Record<SeatType, { bg: string; border: string; text: string; label: string }> = {
  LUXURY: {
    bg: "bg-purple-600 hover:bg-purple-500",
    border: "border-purple-400",
    text: "text-purple-200",
    label: "Luxury (₹500)",
  },
  PLATINUM: {
    bg: "bg-indigo-600 hover:bg-indigo-500",
    border: "border-indigo-400",
    text: "text-indigo-200",
    label: "Platinum (₹350)",
  },
  GOLD: {
    bg: "bg-amber-600 hover:bg-amber-500",
    border: "border-amber-400",
    text: "text-amber-200",
    label: "Gold (₹250)",
  },
  SILVER: {
    bg: "bg-slate-600 hover:bg-slate-500",
    border: "border-slate-400",
    text: "text-slate-200",
    label: "Silver (₹180)",
  },
  FRONT: {
    bg: "bg-teal-600 hover:bg-teal-500",
    border: "border-teal-400",
    text: "text-teal-200",
    label: "Front (₹120)",
  },
};
