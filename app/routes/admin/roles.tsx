import { AdminRolesPage } from "../../pages";
import { AdminFeature } from "../../shared/admin/AdminFeature";

export function meta() {
  return [{ title: "Roles — Honya" }];
}

export default function AdminRolesRoute() {
  return (
    <AdminFeature feature="role.read">
      <AdminRolesPage />
    </AdminFeature>
  );
}
