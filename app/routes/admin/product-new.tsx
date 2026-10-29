import { AdminProductFormPage } from "../../pages";
import { AdminFeature } from "../../shared/admin/AdminFeature";

export function meta() {
  return [{ title: "New product — Honya" }];
}

export default function AdminProductNewRoute() {
  return (
    <AdminFeature feature="catalog.write">
      <AdminProductFormPage />
    </AdminFeature>
  );
}
