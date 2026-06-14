import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Default admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      fullName: 'RT Administrator',
      role: 'admin',
    },
  });
  console.log(`  - Admin user: ${admin.username} (password: admin123)`);

  // 2. Bill types
  const billTypes = [
    {
      name: 'Iuran Keamanan',
      chargeType: 'Flat',
      ratePerUnit: 50000,
      unit: null,
      description: 'Iuran bulanan satpam dan keamanan lingkungan',
      isActive: true,
    },
    {
      name: 'Iuran Kebersihan',
      chargeType: 'Flat',
      ratePerUnit: 25000,
      unit: null,
      description: 'Iuran bulanan pengangkutan sampah',
      isActive: true,
    },
    {
      name: 'PDAM',
      chargeType: 'Variable',
      ratePerUnit: 3500,
      unit: 'm3',
      description: 'Tagihan air PDAM (variable, per meter kubik)',
      isActive: true,
    },
  ];

  for (const bt of billTypes) {
    await prisma.billType.upsert({
      where: { name: bt.name },
      update: {
        chargeType: bt.chargeType,
        ratePerUnit: bt.ratePerUnit,
        unit: bt.unit,
        description: bt.description,
        isActive: bt.isActive,
      },
      create: bt,
    });
  }
  console.log(`  - ${billTypes.length} bill types seeded`);

  // 3. Sample households
  const households = [
    { houseNumber: 'A-01', headOfFamily: 'Budi Santoso', phone: '081234567001', status: 'Active' },
    { houseNumber: 'A-02', headOfFamily: 'Siti Aminah', phone: '081234567002', status: 'Active' },
    { houseNumber: 'A-03', headOfFamily: 'Joko Widodo', phone: '081234567003', status: 'Active' },
    { houseNumber: 'B-01', headOfFamily: 'Dewi Lestari', phone: '081234567004', status: 'Active' },
    { houseNumber: 'B-02', headOfFamily: 'Ahmad Fauzi', phone: '081234567005', status: 'Vacant' },
  ];

  for (const h of households) {
    await prisma.household.upsert({
      where: { houseNumber: h.houseNumber },
      update: { headOfFamily: h.headOfFamily, phone: h.phone, status: h.status },
      create: h,
    });
  }
  console.log(`  - ${households.length} households seeded`);

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
