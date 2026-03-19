export const PriceUtils = {
  calculateBookingTotal: (booking) => {
    const base = Number(booking.basePriceAtBooking || 0);
    const taxPercent = Number(booking.taxPercentageAtBooking || 0);

    let addonsTotal = 0;

    const addons = booking.addons || [];

    for (const a of addons) {
      if (a.status !== "approved") continue;

      const price = Number(a.rate?.price || 0);
      const qty = Number(a.quantity || 1);

      addonsTotal += price * qty;
    }

    const subtotal = base + addonsTotal;
    const tax = (subtotal * taxPercent) / 100;

    return (subtotal + tax).toFixed(2);
  },

  calculateTax: (booking) => {
    const base = Number(booking.basePriceAtBooking || 0);
    const taxPercent = Number(booking.taxPercentageAtBooking || 0);

    let addonsTotal = 0;

    const addons = booking.addons || [];

    for (const a of addons) {
      if (a.status !== "approved") continue;

      const price = Number(a.rate?.price || 0);
      const qty = Number(a.quantity || 1);

      addonsTotal += price * qty;
    }

    const subtotal = base + addonsTotal;
    return ((subtotal * taxPercent) / 100).toFixed(2);
  }
};