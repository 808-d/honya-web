import { AdminProductFormPage } from "../../pages";
import { AdminFeature } from "../../shared/admin/AdminFeature";

export function meta() {
  return [{ title: "Edit product — Honya" }];
}

export default function AdminProductEditRoute() {
  return (
    <AdminFeature feature="catalog.read">
      <AdminProductFormPage />
    </AdminFeature>
  );
}
