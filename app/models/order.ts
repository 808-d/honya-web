// honya-api order enums (internal/modules/order/enums.go).

export const ORDER_STATUS_LABEL: Record<number, string> = {
  0: "Pending",
  1: "Confirmed",
  2: "Processing",
  3: "Shipping",
  4: "Completed",
  5: "Cancelled",
  6: "Refunded",
};

export const PAYMENT_STATUS_LABEL: Record<number, string> = {
  0: "Unpaid",
  1: "Paid",
  2: "Failed",
  3: "Refunded",
};

export const PAYMENT_METHOD_LABEL: Record<number, string> = {
  0: "Cash on delivery",
};

export function orderStatusLabel(status: number): string {
  return ORDER_STATUS_LABEL[status] ?? "Unknown";
}

export function paymentStatusLabel(status: number): string {
  return PAYMENT_STATUS_LABEL[status] ?? "Unknown";
}

export function paymentMethodLabel(method: number): string {
  return PAYMENT_METHOD_LABEL[method] ?? "Unknown";
}

/** Customers may cancel before dispatch and while no payment has been collected. */
export function canCancelOrder(status: number, paymentStatus: number): boolean {
  const beforeDispatch = status === 0 || status === 1 || status === 2;
  const notCollected = paymentStatus === 0 || paymentStatus === 2;
  return beforeDispatch && notCollected;
}

/** Receipt can only be confirmed once the order is shipping. */
export function canConfirmReceipt(status: number): boolean {
  return status === 3;
}

export type OrderChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

export const ORDER_STATUS_COLOR: Record<number, OrderChipColor> = {
  0: "warning",
  1: "info",
  2: "info",
  3: "primary",
  4: "success",
  5: "error",
  6: "default",
};

export const PAYMENT_STATUS_COLOR: Record<number, OrderChipColor> = {
  0: "warning",
  1: "success",
  2: "error",
  3: "default",
};
