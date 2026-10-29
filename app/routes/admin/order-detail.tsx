import { AdminOrderDetailPage } from "../../pages";
import { AdminFeature } from "../../shared/admin/AdminFeature";

export function meta() {
  return [{ title: "Order — Honya" }];
}

export default function AdminOrderDetailRoute() {
  return (
    <AdminFeature feature="order.read">
      <AdminOrderDetailPage />
    </AdminFeature>
  );
}
