import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Seat = {
  id: number;
  x: number;
  y: number;
  status: "available" | "sold";
  price: number;
  label?: string;
  section?: string;
};

interface SeatStore {
  seats: Seat[];
  selected: number[];
  selectedSeats: string[];

  // selector de usuario
  setSeats: (seats: Seat[]) => void;
  toggleSelect: (id: number) => void;

  // funciones del editor
  addSeat: (seat: Seat) => void;
  removeSeat: (id: number) => void;
  updateSeatPosition: (id: number, x: number, y: number) => void;
  setSelected: (selected: number[]) => void;

  addSelectedSeat: (seatId: string) => void;
  removeSelectedSeat: (seatId: string) => void;
  clearSelectedSeats: () => void;
  toggleSeatSelection: (seatId: string) => void;
}

export const useSeatStore = create<SeatStore>()(
  persist(
    (set, get) => ({
      seats: [],
      selected: [],
      selectedSeats: [],
      setSelected: (selected) => set({ selected }),
      // cargar seats (cliente o editor)
      setSeats: (seats) => set({ seats }),

      // selección (cliente)
      toggleSelect: (id) => {
        const selected = get().selected;
        set({
          selected: selected.includes(id)
            ? selected.filter((s) => s !== id)
            : [...selected, id],
        });
      },

      // editor: agregar asiento
      addSeat: (seat) =>
        set((state) => ({
          seats: [...state.seats, seat],
        })),

      // editor: eliminar asiento
      removeSeat: (id) =>
        set((state) => ({
          seats: state.seats.filter((s) => s.id !== id),
        })),

      // editor: mover asiento
      updateSeatPosition: (id, x, y) =>
        set((state) => ({
          seats: state.seats.map((s) => (s.id === id ? { ...s, x, y } : s)),
        })),

      addSelectedSeat: (seatId: string) => {
        set((state) => ({
          selectedSeats: [...state.selectedSeats, seatId],
        }));
      },

      removeSelectedSeat: (seatId: string) => {
        set((state) => ({
          selectedSeats: state.selectedSeats.filter((id) => id !== seatId),
        }));
      },

      clearSelectedSeats: () => {
        set({ selectedSeats: [] });
      },

      toggleSeatSelection: (seatId: string) => {
        const { selectedSeats } = get();
        if (selectedSeats.includes(seatId)) {
          get().removeSelectedSeat(seatId);
        } else {
          get().addSelectedSeat(seatId);
        }
      },
    }),
    {
      name: "seat-store",
      partialize: (state) => ({
        seats: state.seats,
        // No persistir la selección para evitar conflictos
        // selected: state.selected,
        // selectedSeats: state.selectedSeats,
      }),
    }
  )
);
