import { HomePage } from "../pages";

export function meta() {
  return [
    { title: "Honya — Manga & Bookshop" },
    { name: "description", content: "A Kanagawa-wave bookshop for manga, light novels and books from every shore." },
  ];
}

export default function Home() {
  return <HomePage />;
}
