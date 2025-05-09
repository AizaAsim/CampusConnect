import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      fullName: 'Admin User',
      role: Role.ADMIN,
    },
  });
  console.log('Created admin user:', admin.username);

  // Create a club admin
  const clubAdminPassword = await hashPassword('clubadmin123');
  const clubAdmin = await prisma.user.upsert({
    where: { username: 'clubadmin' },
    update: {},
    create: {
      username: 'clubadmin',
      password: clubAdminPassword,
      fullName: 'Club Admin',
      role: Role.CLUB_ADMIN,
    },
  });
  console.log('Created club admin user:', clubAdmin.username);

  // Create a regular student
  const studentPassword = await hashPassword('student123');
  const student = await prisma.user.upsert({
    where: { username: 'student' },
    update: {},
    create: {
      username: 'student',
      password: studentPassword,
      fullName: 'Student User',
      role: Role.STUDENT,
    },
  });
  console.log('Created student user:', student.username);

  // Create a club
  const computerScienceClub = await prisma.club.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Computer Science Club',
      description: 'A club for computer science enthusiasts',
      category: 'Technology',
      meetingTime: 'Thursdays at 5:00 PM',
      adminId: clubAdmin.id,
    },
  });
  console.log('Created club:', computerScienceClub.name);

  // Add the student as a member of the club
  const clubMembership = await prisma.clubMember.upsert({
    where: {
      clubId_userId: {
        clubId: computerScienceClub.id,
        userId: student.id,
      },
    },
    update: {},
    create: {
      clubId: computerScienceClub.id,
      userId: student.id,
      isAdmin: false,
    },
  });
  console.log('Added student to club');

  // Create an event
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7); // One week from now

  const event = await prisma.event.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Introduction to Algorithms',
      description:
        'A beginner-friendly session on algorithms and their applications',
      dateTime: futureDate,
      location: 'Computer Science Building, Room 101',
      organizerId: clubAdmin.id,
      clubId: computerScienceClub.id,
    },
  });
  console.log('Created event:', event.title);

  // Add the student as an attendee
  const eventAttendee = await prisma.eventAttendee.upsert({
    where: {
      eventId_userId: {
        eventId: event.id,
        userId: student.id,
      },
    },
    update: {},
    create: {
      eventId: event.id,
      userId: student.id,
      status: 'GOING',
    },
  });
  console.log('Added student as event attendee');

  // Create a post
  const post = await prisma.post.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Welcome to the Computer Science Club!',
      content:
        'We are excited to welcome all new members to our club. Stay tuned for upcoming events!',
      authorId: clubAdmin.id,
    },
  });
  console.log('Created post:', post.title);

  // Add a comment from the student
  const comment = await prisma.comment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      content: 'Looking forward to all the events!',
      postId: post.id,
      authorId: student.id,
    },
  });
  console.log('Added comment to post');

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
