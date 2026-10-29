import { AdminNamesPage } from "../../pages";
import { AdminFeature } from "../../shared/admin/AdminFeature";

export function meta() {
  return [{ title: "Tags — Honya" }];
}

export default function AdminTagsRoute() {
  return (
    <AdminFeature feature="catalog.read">
      <AdminNamesPage resource="tags" />
    </AdminFeature>
  );
}
