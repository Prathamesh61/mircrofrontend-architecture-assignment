export const products = [
  {
    id: 1,
    name: "Laptop",
    price: 75000,
  },
  {
    id: 2,
    name: "Wireless Headphones",
    price: 5000,
  },
  {
    id: 3,
    name: "Mechanical Keyboard",
    price: 3500,
  },
  {
    id: 4,
    name: "Gaming Mouse",
    price: 2000,
  },
  {
    id: 5,
    name: "4K Monitor",
    price: 30000,
  },
];

export const formatPrice = (price) => {
  return `₹${price.toLocaleString("en-IN")}`;
};
