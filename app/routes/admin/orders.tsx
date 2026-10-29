import { AdminOrdersPage } from "../../pages";
import { AdminFeature } from "../../shared/admin/AdminFeature";

export function meta() {
  return [{ title: "Orders — Honya" }];
}

export default function AdminOrdersRoute() {
  return (
    <AdminFeature feature="order.read">
      <AdminOrdersPage />
    </AdminFeature>
  );
}
