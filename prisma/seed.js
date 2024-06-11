const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
// Create Users
  await prisma.User.createMany({
    data: [
      {
        id: '3C7AEA76-64D6-4845-BBB8-F1C1A702C9CD',
        email: 'user1@example.com',
        name: 'User 1',
      },
      {
        id: '758A55EE-3484-4C58-8024-86C66D99B947',
        email: 'user2@example.com',
        name: 'User 2',
      },
    ],
    skipDuplicates: true,
  });

  // Create search criteria
  await prisma.SearchCriteria.createMany({
    data: [
      {
        jobCategory: 'Full-Stack Engineer',
        jobLevel: 'MID_SENIOR',
        region: 'Remote',
        userId: '3C7AEA76-64D6-4845-BBB8-F1C1A702C9CD',
      },
      {
        jobCategory: 'Frontend Engineering',
        jobLevel: 'ENTRY',
        region: 'Worldwide',
        userId: '758A55EE-3484-4C58-8024-86C66D99B947',
      },
    ],
  });


  // Create Connectors
  await prisma.Connector.createMany({
    data: [
      {
        id: '47A96FD0-3B2E-4C7F-A9D3-E5C0E547D44B',
        name: 'arc.dev',
        type: 'WEB',
        frequency: 'EVERY_DAY',
        config: {},
        status: 'OFFLINE',
      },
      {
        id: '17A414E4-4CA3-4733-8B28-7053E50E029E',
        name: 'justremote.co',
        type: 'WEB',
        frequency: 'EVERY_DAY',
        config: {},
        status: 'OFFLINE',
      },
      {
        id: 'D82E4D7C-A3D6-4732-AD28-85367521504E',
        name: 'web3.career',
        type: 'WEB',
        frequency: 'EVERY_6_HOURS',
        config: {},
        status: 'ONLINE',
      },
      {
        id: '34B6A056-6BC1-4192-B955-928D26C5B79D',
        name: 'weworkremotely.com',
        type: 'RSS',
        frequency: 'EVERY_DAY',
        config: {
          url: 'https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss'
        },
        status: 'ONLINE',
      },
    ],
    skipDuplicates: true,
  });

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
