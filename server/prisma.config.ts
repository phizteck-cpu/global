import { defineConfig } from '@prisma/config';

export default defineConfig({
    schema: {
        kind: 'file',
        filePath: 'prisma/schema.prisma',
    },
    commands: {
        migrate: {
            url: process.env.DATABASE_URL,
        },
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
