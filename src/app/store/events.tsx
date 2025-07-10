import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Venue = {
  id: string;
  name: string;
  description?: string;
  address?: string;
  capacity?: number;
};

export type EventDay = {
  id: string;
  eventId: string;
  venueId: string;
  planId: string;
  date: string;
  time?: string;
  description?: string;
};

export type Event = {
  id: string;
  name: string;
  description?: string;
  days: EventDay[];
};

import { PlanShape, GridConfig } from "./plans";

export type SavedPlan = {
  id: string;
  title: string;
  eventId: string;
  dayId: string;
  venueId: string;
  shapes: PlanShape[];
  gridConfig: GridConfig;
  createdAt: string;
  updatedAt: string;
};

interface EventStore {
  venues: Venue[];
  events: Event[];
  savedPlans: SavedPlan[];

  // Localidades
  addVenue: (venue: Omit<Venue, "id">) => void;
  updateVenue: (id: string, updates: Partial<Venue>) => void;
  removeVenue: (id: string) => void;

  // Eventos
  addEvent: (event: Omit<Event, "id">) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  removeEvent: (id: string) => void;

  // Planos guardados
  savePlan: (plan: Omit<SavedPlan, "id" | "createdAt" | "updatedAt">) => void;
  updatePlan: (id: string, updates: Partial<SavedPlan>) => void;
  removePlan: (id: string) => void;
  getPlansByEvent: (eventId: string) => SavedPlan[];
  getPlansByDay: (dayId: string) => SavedPlan[];
  getPlansByVenue: (venueId: string) => SavedPlan[];
}

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      venues: [],
      events: [],
      savedPlans: [],

      addVenue: (venueData) => {
        const newVenue: Venue = {
          id: `venue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...venueData,
        };
        set((state) => ({
          venues: [...state.venues, newVenue],
        }));
      },

      updateVenue: (id, updates) => {
        set((state) => ({
          venues: state.venues.map((venue) =>
            venue.id === id ? { ...venue, ...updates } : venue
          ),
        }));
      },

      removeVenue: (id) => {
        set((state) => ({
          venues: state.venues.filter((venue) => venue.id !== id),
        }));
      },

      addEvent: (eventData) => {
        const newEvent: Event = {
          id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...eventData,
        };
        set((state) => ({
          events: [...state.events, newEvent],
        }));
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...updates } : event
          ),
        }));
      },

      removeEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },

      savePlan: (planData) => {
        const now = new Date().toISOString();
        const newPlan: SavedPlan = {
          id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...planData,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          savedPlans: [...state.savedPlans, newPlan],
        }));
      },

      updatePlan: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          savedPlans: state.savedPlans.map((plan) =>
            plan.id === id ? { ...plan, ...updates, updatedAt: now } : plan
          ),
        }));
      },

      removePlan: (id) => {
        set((state) => ({
          savedPlans: state.savedPlans.filter((plan) => plan.id !== id),
        }));
      },

      getPlansByEvent: (eventId) => {
        const { savedPlans } = get();
        return savedPlans.filter((plan) => plan.eventId === eventId);
      },

      getPlansByDay: (dayId) => {
        const { savedPlans } = get();
        return savedPlans.filter((plan) => plan.dayId === dayId);
      },

      getPlansByVenue: (venueId) => {
        const { savedPlans } = get();
        return savedPlans.filter((plan) => plan.venueId === venueId);
      },
    }),
    {
      name: "event-store",
      partialize: (state) => ({
        venues: state.venues,
        events: state.events,
        savedPlans: state.savedPlans,
      }),
    }
  )
);
