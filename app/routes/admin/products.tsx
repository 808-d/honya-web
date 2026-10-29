import { AdminProductsPage } from "../../pages";
import { AdminFeature } from "../../shared/admin/AdminFeature";

export function meta() {
  return [{ title: "Products — Honya" }];
}

export default function AdminProductsRoute() {
  return (
    <AdminFeature feature="catalog.read">
      <AdminProductsPage />
    </AdminFeature>
  );
}
