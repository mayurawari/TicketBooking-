"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export const POPULAR_CITIES = [
  "Mumbai",
  "Delhi-NCR",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
  "Kochi",
  "Goa",
  "Lucknow",
  "Indore",
  "Surat"
];

interface CityContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  availableCities: string[];
  isCityModalOpen: boolean;
  openCityModal: () => void;
  closeCityModal: () => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [selectedCity, setSelectedCityState] = useState<string>("Mumbai");
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  useEffect(() => {
    // Restore saved city from localStorage
    const saved = localStorage.getItem("bms_selected_city");
    if (saved) {
      setSelectedCityState(saved);
    }
  }, []);

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    localStorage.setItem("bms_selected_city", city);
    setIsCityModalOpen(false);
  };

  const openCityModal = () => setIsCityModalOpen(true);
  const closeCityModal = () => setIsCityModalOpen(false);

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        availableCities: ["All Cities", ...POPULAR_CITIES],
        isCityModalOpen,
        openCityModal,
        closeCityModal
      }}
    >
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error("useCity must be used within a CityProvider");
  }
  return context;
}
