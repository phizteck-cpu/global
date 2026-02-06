import { runDailyContributions } from './services/contributionAutomation.js';

async function test() {
    console.log('--- STRESS TEST: STARTING AUTOMATION WORKER ---');
    await runDailyContributions();
    console.log('--- STRESS TEST: AUTOMATION WORKER FINISHED ---');
    process.exit(0);
}

test();
