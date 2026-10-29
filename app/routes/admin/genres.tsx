import { AdminNamesPage } from "../../pages";
import { AdminFeature } from "../../shared/admin/AdminFeature";

export function meta() {
  return [{ title: "Genres — Honya" }];
}

export default function AdminGenresRoute() {
  return (
    <AdminFeature feature="catalog.read">
      <AdminNamesPage resource="genres" />
    </AdminFeature>
  );
}
