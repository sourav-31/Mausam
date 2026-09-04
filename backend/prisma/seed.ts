import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const passwordHash = await bcrypt.hash('password123', 10);

  // Profiles
  const profiles = [
    { name: 'Student Demo', email: 'student@demo.com', profile: 'Student', city: 'Indore', lat: 22.7196, lon: 75.8577 },
    { name: 'Farmer Demo', email: 'farmer@demo.com', profile: 'Farmer', city: 'Bhopal', lat: 23.2599, lon: 77.4126 },
    { name: 'Traveller Demo', email: 'traveller@demo.com', profile: 'Traveller', city: 'Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'Driver Demo', email: 'driver@demo.com', profile: 'Driver', city: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { name: 'Fitness Demo', email: 'fitness@demo.com', profile: 'Fitness Enthusiast', city: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
    { name: 'General Demo', email: 'general@demo.com', profile: 'General User', city: 'Pune', lat: 18.5204, lon: 73.8567 },
  ];

  for (const p of profiles) {
    const existing = await prisma.user.findUnique({ where: { email: p.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: p.name,
          email: p.email,
          password: passwordHash,
          profile: {
            create: {
              primaryProfile: p.profile
            }
          },
          savedLocations: {
            create: {
              name: 'Home',
              city: p.city,
              latitude: p.lat,
              longitude: p.lon,
              isPrimary: true
            }
          },
          settings: {
            create: {
              darkMode: false,
              notificationsEnabled: true
            }
          }
        }
      });
      console.log(`Created user: ${p.name}`);
    } else {
      console.log(`User ${p.name} already exists.`);
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
