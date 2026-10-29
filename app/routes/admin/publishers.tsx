import { AdminNamesPage } from "../../pages";
import { AdminFeature } from "../../shared/admin/AdminFeature";

export function meta() {
  return [{ title: "Publishers — Honya" }];
}

export default function AdminPublishersRoute() {
  return (
    <AdminFeature feature="catalog.read">
      <AdminNamesPage resource="publishers" />
    </AdminFeature>
  );
}
