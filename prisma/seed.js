const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {

  // Create Job Categories
  const engineerCategory = await prisma.JobCategory.create({
    data: {
      name: 'Engineer',
    },
  });

  await prisma.JobCategory.createMany({
    data: [
      {
        name: 'Full-Stack Engineer',
        parentId: engineerCategory.id,
      },
      {
        name: 'Backend Engineer',
        parentId: engineerCategory.id,
      },
      {
        name: 'Frontend Engineer',
        parentId: engineerCategory.id,
      },
      {
        name: 'Site Reliability Engineer',
        parentId: engineerCategory.id,
      },
      {
        name: 'Mobile Engineer',
        parentId: engineerCategory.id,
      },
      {
        name: 'Mobile iOS Engineer',
        parentId: engineerCategory.id,
      },
      {
        name: 'Mobile Android Engineer',
        parentId: engineerCategory.id,
      },
      {
        name: 'QA Engineer',
        parentId: engineerCategory.id,
      },
      {
        name: 'Tech Lead',
        parentId: engineerCategory.id,
      },
      {
        name: 'Staff Engineer',
        parentId: engineerCategory.id,
      },
    ],
    skipDuplicates: true,
  });

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

  // Create UserSearch criteria
  await prisma.UserSearch.createMany({
    data: [
      {
        category: 'Full-Stack Engineer',
        categoryParent: 'Engineer',
        level: 'MID_SENIOR',
        region: 'Remote',
        userId: '3C7AEA76-64D6-4845-BBB8-F1C1A702C9CD',
      },
      {
        category: 'Frontend Engineer',
        categoryParent: 'Engineer',
        level: 'ENTRY',
        region: 'Worldwide',
        userId: '758A55EE-3484-4C58-8024-86C66D99B947',
      },
    ],
    skipDuplicates: true,
  });


  // Create Connectors
  await prisma.Connector.createMany({
    data: [
      {
        id: '47A96FD0-3B2E-4C7F-A9D3-E5C0E547D44B',
        name: 'arc.dev',
        type: 'WEB',
        frequency: 'EVERY_DAY',
        config: {
          url: 'https://arc.dev/remote-jobs?jobLevels=senior&jobTypes=fulltime&jobRoles=engineering&disciplines=back-end'
        },
        status: 'OFFLINE',
      },
      {
        id: '17A414E4-4CA3-4733-8B28-7053E50E029E',
        name: 'justremote.co',
        type: 'WEB',
        frequency: 'EVERY_DAY',
        config: {
          url: 'https://justremote.co/remote-developer-jobs'
        },
        status: 'OFFLINE',
      },
      {
        id: 'D82E4D7C-A3D6-4732-AD28-85367521504E',
        name: 'web3.career',
        type: 'WEB',
        frequency: 'EVERY_DAY',
        config: {
          url: 'https://web3.career/remote-jobs'
        },
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
      {
        id: '083D5898-21C8-4509-A0EA-2ACBC0FA9F5D',
        name: 'himalayas.app',
        type: 'RSS',
        frequency: 'EVERY_DAY',
        config: {
          url: 'https://himalayas.app/jobs/rss'
        },
        status: 'ONLINE',
      },
      {
        id: 'FB2100AF-0560-4E51-B69F-165CF2118CD7',
        name: 'remoteok.com',
        type: 'API',
        frequency: 'EVERY_DAY',
        config: {
          url: 'https://remoteok.com/api'
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
