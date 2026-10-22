import { ProductsPage } from "../pages";

export function meta() {
  return [
    { title: "Shelves — Honya" },
    { name: "description", content: "Browse the manga, novel and book shelves." },
  ];
}

export default function Products() {
  return <ProductsPage />;
}
