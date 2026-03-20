export const PriceUtils = {
  calculateAddonsTotal: (booking) => {
    const addons = booking?.addons || [];

    return addons.reduce((sum, addon) => {
      if (addon.status !== "approved") return sum;

      const price = Number(addon.rate?.price || addon.price || 0);
      const qty = Number(addon.quantity || 1);

      return sum + price * qty;
    }, 0);
  },

  calculateSubtotal: (booking) => {
    const base = Number(booking?.basePriceAtBooking || 0);
    return base + PriceUtils.calculateAddonsTotal(booking);
  },

  calculateBookingTotal: (booking) => {
    const subtotal = PriceUtils.calculateSubtotal(booking);
    const taxPercent = Number(booking?.taxPercentageAtBooking || 0);
    const tax = (subtotal * taxPercent) / 100;

    return (subtotal + tax).toFixed(2);
  },

  calculateTax: (booking) => {
    const subtotal = PriceUtils.calculateSubtotal(booking);
    const taxPercent = Number(booking?.taxPercentageAtBooking || 0);
    return ((subtotal * taxPercent) / 100).toFixed(2);
  },
};
