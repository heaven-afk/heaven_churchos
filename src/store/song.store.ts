/**
 * Song Store — Phase 1 §6.2
 *
 * Manages the song library in the Operator Workstation.
 * Supports viewing, searching, creating, editing, and deleting songs.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Song } from "@/types/content.types";

export interface SongState {
  songs: Song[];
  selectedSongId: string | null;
  searchQuery: string;

  // Actions
  selectSong: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  createSong: (song: Omit<Song, "id" | "createdAt" | "updatedAt">) => Song;
  updateSong: (id: string, patch: Partial<Song>) => void;
  deleteSong: (id: string) => void;
}

const DEFAULT_SONGS: Song[] = [
  {
    id: "song-amazing-grace",
    title: "Amazing Grace",
    artist: "John Newton",
    author: "John Newton",
    ccliNumber: "22025",
    sections: [
      {
        id: "sec-ag-v1",
        type: "verse",
        label: "Verse 1",
        body: "Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.",
        order: 0,
        slides: [
          "Amazing grace! How sweet the sound\nThat saved a wretch like me!",
          "I once was lost, but now am found;\nWas blind, but now I see.",
        ],
      },
      {
        id: "sec-ag-v2",
        type: "verse",
        label: "Verse 2",
        body: "'Twas grace that taught my heart to fear,\nAnd grace my fears relieved;\nHow precious did that grace appear\nThe hour I first believed.",
        order: 1,
        slides: [
          "'Twas grace that taught my heart to fear,\nAnd grace my fears relieved;",
          "How precious did that grace appear\nThe hour I first believed.",
        ],
      },
      {
        id: "sec-ag-v3",
        type: "verse",
        label: "Verse 3",
        body: "Through many dangers, toils and snares,\nI have already come;\n'Tis grace hath brought me safe thus far,\nAnd grace will lead me home.",
        order: 2,
        slides: [
          "Through many dangers, toils and snares,\nI have already come;",
          "'Tis grace hath brought me safe thus far,\nAnd grace will lead me home.",
        ],
      },
      {
        id: "sec-ag-v4",
        type: "verse",
        label: "Verse 4",
        body: "When we've been there ten thousand years,\nBright shining as the sun,\nWe've no less days to sing God's praise\nThan when we'd first begun.",
        order: 3,
        slides: [
          "When we've been there ten thousand years,\nBright shining as the sun,",
          "We've no less days to sing God's praise\nThan when we'd first begun.",
        ],
      },
    ],
    arrangement: ["sec-ag-v1", "sec-ag-v2", "sec-ag-v3", "sec-ag-v4"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useSongStore = create<SongState>()(
  persist(
    (set) => ({
      songs: DEFAULT_SONGS,
      selectedSongId: DEFAULT_SONGS[0].id,
      searchQuery: "",

      selectSong: (id) => set({ selectedSongId: id }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      createSong: (songData) => {
        const now = new Date().toISOString();
        const id = `song-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newSong: Song = {
          ...songData,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          songs: [newSong, ...state.songs],
          selectedSongId: id,
        }));

        return newSong;
      },

      updateSong: (id, patch) => {
        set((state) => ({
          songs: state.songs.map((s) =>
            s.id === id
              ? {
                  ...s,
                  ...patch,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        }));
      },

      deleteSong: (id) => {
        set((state) => {
          const remaining = state.songs.filter((s) => s.id !== id);
          return {
            songs: remaining,
            selectedSongId:
              state.selectedSongId === id
                ? (remaining[0]?.id ?? null)
                : state.selectedSongId,
          };
        });
      },
    }),
    {
      name: "presentation_song_library",
      skipHydration: true,
      partialize: (state) => ({ songs: state.songs }),
    }
  )
);
