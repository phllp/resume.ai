# resume.ai

The idea behind this app is to transcript videos and to generate a brief summary on them.

In order to achieve that, the OpenAI API and it's AI models were used.

## Requirements

- NodeJS
- pnpm (or similar)
- Docker

## Project Setup

First, clone the repository and navigate to the folder:

```bash
git clone https://github.com/phllp/resume.ai.git
cd resume.ai
```

Then install all the dependencies

```bash
pnpm i
```

Make sure that the database is running and the migrations are applied.

**Important:** Make sure that the database URL is correct inside the **.env** file

```bash
docker compose up -d
npx prisma migrate dev
npm prisma generate
```

Now setup your OpenAI API key, just replace the default value in the **.env** file

```bash
docker compose up -d
npx prisma migrate dev
npm prisma generate
```

Your good to go now, just start the development server and all should be working just fine.

```bash
pnpm i
```

## Tutorial

A quick explanation on the app usage:

1. Upload a video by clicking on the Video Select component and selecting a video from your computer
2. (Optional) On the "Whats the video's theme?" text input, you can provide aditional context, to improve the AI model performance
3. Click on "Load Video", and that's all.
