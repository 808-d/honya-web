export interface LibraryOrder {
  id: string;
  bookId: string;
  title: string;
  date: string;
  status: "on-shelf" | "in-transit" | "reading";
  price: number;
}

export interface LibraryUser {
  id: string;
  name: string;
  handle: string;
  email: string;
  memberSince: string;
  memberNo: string;
  shelfCount: number;
  currentlyReadingId: string;
  favoriteKind: "manga" | "light-novel";
  orders: LibraryOrder[];
}
