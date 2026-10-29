import { AdminUsersPage } from "../../pages";
import { AdminFeature } from "../../shared/admin/AdminFeature";

export function meta() {
  return [{ title: "Users — Honya" }];
}

export default function AdminUsersRoute() {
  return (
    <AdminFeature feature="user.read">
      <AdminUsersPage />
    </AdminFeature>
  );
}
