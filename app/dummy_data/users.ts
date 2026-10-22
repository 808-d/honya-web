import type { LibraryUser } from "../models/user";

export const dummyUser: LibraryUser = {
  id: "u-001",
  name: "Aoi Tachibana",
  handle: "@aoi_reads",
  email: "aoi@example.com",
  memberSince: "March 2022",
  memberNo: "HNY-0417",
  shelfCount: 132,
  currentlyReadingId: "tide-of-ink-1",
  favoriteKind: "manga",
  orders: [
    { id: "HNY-90312", bookId: "borrowed-time-bookshop", title: "The Borrowed-Time Bookshop", date: "2026-09-18", status: "reading", price: 1600 },
    { id: "HNY-89902", bookId: "tide-of-ink-2", title: "Tide of Ink, Vol. 2", date: "2026-08-30", status: "on-shelf", price: 880 },
    { id: "HNY-89177", bookId: "whale-fall-library", title: "Whale Fall Library", date: "2026-07-12", status: "on-shelf", price: 1720 },
    { id: "HNY-88410", bookId: "moon-rabbit-delivery", title: "Moon Rabbit Delivery Service", date: "2026-05-02", status: "in-transit", price: 790 },
  ],
};

export const dummyNotices = [
  { id: "n1", label: "Hold ready", text: "Whale Fall Library is waiting at the Kanda counter.", date: "Oct 12" },
  { id: "n2", label: "Stamp ×2", text: "October stamp rally: manga + light novel = double hanko.", date: "Oct 01" },
  { id: "n3", label: "Overdue", text: "Plum Rain Detective, Case 4 — due back Sunday.", date: "Sep 28" },
];
