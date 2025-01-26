import Order from "../../../models/order.js";

export const getOrderDetails = (orderId) => {
  return Order.findById(orderId).populate('products.product products.company') || [];;
}
