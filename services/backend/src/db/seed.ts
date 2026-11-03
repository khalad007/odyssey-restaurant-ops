import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  customers,
  menuCategories,
  menuItems,
  orderItems,
  orders,
  orderStatusEnum,
  orderTypeEnum,
  settings,
} from './schema';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL must be set before seeding.');

// A fixed PRNG seed reproduces IDs, selections, quantities, and prices.
let randomState = 20261104;
function random() {
  randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
  return randomState / 4294967296;
}

function uuid() {
  const bytes = Array.from({ length: 16 }, () => Math.floor(random() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Anchor relative dates to UTC midnight so repeated runs today are identical,
// while future runs still populate the most recent 30 days.
const anchor = new Date();
anchor.setUTCHours(0, 0, 0, 0);
const dayMs = 24 * 60 * 60 * 1000;
const catalogTimestamp = new Date(anchor.getTime() - 30 * dayMs);
const timestamps = { createdAt: catalogTimestamp, updatedAt: catalogTimestamp };

const catalog = [
  { name: 'Starters', items: ['Tomato Soup', 'Garlic Bread', 'Garden Salad', 'Chicken Wings', 'Hummus Plate'] },
  { name: 'Mains', items: ['Grilled Chicken', 'Beef Burger', 'Fish and Chips', 'Vegetable Curry', 'Mushroom Pasta'] },
  { name: 'Pizza', items: ['Margherita', 'Pepperoni', 'Four Cheese', 'Vegetable Pizza', 'BBQ Chicken Pizza'] },
  { name: 'Desserts', items: ['Chocolate Brownie', 'Cheesecake', 'Apple Pie', 'Vanilla Ice Cream', 'Fruit Salad'] },
  { name: 'Drinks', items: ['Lemonade', 'Iced Tea', 'Espresso', 'Mango Smoothie', 'Sparkling Water'] },
];

const categoryRows = catalog.map((category, sortOrder) => ({
  id: uuid(), name: category.name, sortOrder, ...timestamps,
}));

const menuRows = catalog.flatMap((category, categoryIndex) =>
  category.items.map((name, itemIndex) => ({
    id: uuid(),
    categoryId: categoryRows[categoryIndex].id,
    name,
    description: `${name}, freshly prepared by the Odyssey kitchen.`,
    priceCents: 300 + Math.floor(random() * 30) * 50,
    isAvailable: categoryIndex * 5 + itemIndex < 23,
    ...timestamps,
  })),
);

const customerRows = [
  'Amina Rahman', 'Daniel Chen', 'Sara Ahmed', 'Omar Hassan', 'Maya Patel',
  'Liam Wilson', 'Nadia Islam', 'Noah Kim', 'Zara Ali', 'Ethan Brown',
  'Leila Khan', 'Lucas Garcia', 'Priya Das', 'Adam Lee', 'Sofia Martin',
].map((name, i) => ({
  id: uuid(), name, phone: `+1555000${String(i + 1).padStart(4, '0')}`,
  email: `customer${i + 1}@example.com`, ...timestamps,
}));

const orderRows: (typeof orders.$inferInsert)[] = [];
const lineRows: (typeof orderItems.$inferInsert)[] = [];
for (let i = 0; i < 40; i++) {
  const orderId = uuid();
  const lineCount = 1 + Math.floor(random() * 4);
  const selectedItems = [...menuRows];
  let subtotalCents = 0;
  for (let j = 0; j < lineCount; j++) {
    const itemIndex = Math.floor(random() * selectedItems.length);
    const [item] = selectedItems.splice(itemIndex, 1);
    const quantity = 1 + Math.floor(random() * 3);
    subtotalCents += quantity * item.priceCents;
    lineRows.push({
      id: uuid(), orderId, menuItemId: item.id, quantity,
      nameSnapshot: item.name, unitPriceCentsSnapshot: item.priceCents,
    });
  }
  // The first 30 orders cover every day offset; all statuses/types cycle.
  const createdAt = new Date(anchor.getTime() - (i % 30) * dayMs);
  orderRows.push({
    id: orderId,
    customerId: customerRows[i % customerRows.length].id,
    orderType: orderTypeEnum.enumValues[i % orderTypeEnum.enumValues.length],
    status: orderStatusEnum.enumValues[i % orderStatusEnum.enumValues.length],
    subtotalCents,
    totalCents: subtotalCents,
    notes: i % 5 === 0 ? 'Please include napkins.' : null,
    createdAt,
    updatedAt: createdAt,
  });
}

const client = postgres(databaseUrl, { max: 1 });
try {
  const db = drizzle(client);
  await db.transaction(async (tx) => {
    // This development seed replaces all data in these tables atomically.
    // Delete children before parents to respect every foreign key.
    await tx.delete(orderItems);
    await tx.delete(orders);
    await tx.delete(menuItems);
    await tx.delete(menuCategories);
    await tx.delete(customers);
    await tx.delete(settings);

    await tx.insert(menuCategories).values(categoryRows);
    await tx.insert(menuItems).values(menuRows);
    await tx.insert(customers).values(customerRows);
    await tx.insert(settings).values({
      id: 1,
      prepTimeMinutes: 20,
      autoAcceptOrders: false,
      acceptingOrders: true,
      openingHours: {
        monday: { open: '09:00', close: '22:00' },
        tuesday: { open: '09:00', close: '22:00' },
        wednesday: { open: '09:00', close: '22:00' },
        thursday: { open: '09:00', close: '22:00' },
        friday: { open: '09:00', close: '22:00' },
        saturday: { open: '09:00', close: '22:00' },
        sunday: { open: '09:00', close: '22:00' },
      },
    });
    await tx.insert(orders).values(orderRows);
    await tx.insert(orderItems).values(lineRows);
  });
  console.log(`Seeded 5 categories, 25 menu items (2 unavailable), 15 customers, 1 settings row, 40 orders, and ${lineRows.length} order items.`);
} finally {
  await client.end();
}
