import { AdminNamesPage } from "../../pages";
import { AdminFeature } from "../../shared/admin/AdminFeature";

export function meta() {
  return [{ title: "Authors — Honya" }];
}

export default function AdminAuthorsRoute() {
  return (
    <AdminFeature feature="catalog.read">
      <AdminNamesPage resource="authors" />
    </AdminFeature>
  );
}
