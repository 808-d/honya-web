import { AdminCouponsPage } from "../../pages";
import { AdminFeature } from "../../shared/admin/AdminFeature";

export function meta() {
  return [{ title: "Coupons — Honya" }];
}

export default function AdminCouponsRoute() {
  return (
    <AdminFeature feature="coupon.read">
      <AdminCouponsPage />
    </AdminFeature>
  );
}
