## About

An open-source self-hosted solution designed to enhance the job search process for candidates by collecting,
aggregating, and analyzing job listings from hundreds of job boards. Utilizing Large Language Models
(LLMs), JobTailor structures job details, extracts key requirements, matches candidates, and tailors CVs to
closely align with job specifications.

## Key Features (In-Progress)
- Job Search: Search for jobs based on keywords, location, job type, and other filters.
- Job Recommendations: Get personalized job recommendations based on your profile and preferences.
- Job Tracking: Keep track of the jobs you've applied to and their status.
- CV Builder: Create and manage your professional CV.
- Job Alerts: Receive notifications for new job postings that match your criteria.
- Company Insights: Get detailed information about companies, including reviews and ratings.

## Built With
- **Frontend**: [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [TailwindCSS](https://tailwindcss.com/)
- **Backend**: [NestJS](https://nestjs.com/), [TypeScript](https://www.typescriptlang.org/), [Prisma](https://www.prisma.io/), [PostgresDB](https://www.postgresql.org/)
- **Messaging**: [Bull MQ](https://github.com/taskforcesh/bullmq)
- **Web Scraping**: [Crawlee](https://crawlee.dev/), [Playwright](https://playwright.dev/)
- **LLM**: [Groq](https://groq.ai/), [OpenAI](https://openai.com/)

## Getting Started for Developers

## Requirements
- [Node.js](https://nodejs.org/en/) >= 18.0.0
- [pnpm](https://pnpm.io/) >= 8.6.12
- Docker (for running PostgreSQL and Redis)

### Setup

Clone the repository:

```bash
git clone https://github.com/stevencrawford/job-tailor.git
cd job-tailor
```

Install dependencies:

```bash
pnpm install
```

Configure environment variables:

Create a .env file in the root directory and add the required environment variables. You can use the .env.example file as a template.

Set up the database:

```bash
pnpm run docker:up
```

This will start PostgreSQL and Redis containers.

Run database migrations:
```bash
pnpm run prisma:push
```

Start the development server:

```bash
pnpm run dev
```

This will start the NestJS backend server and the React development server.

You can now access the application at http://localhost:3000.
