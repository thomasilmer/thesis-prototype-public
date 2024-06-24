import {parse} from 'csv';
import fs from 'fs';

import {Bot, BotCategory, BotCategoryPivot} from './database/definitions/bots.js';

const ciTaskAssistance = await BotCategory.create({
    name: 'CI Task Assistance',
});

const codeReviewAssistance = await BotCategory.create({
    name: 'Code Review Assistance',
});

const communityManagement = await BotCategory.create({
    name: 'Community Management',
});

const dependencySecurityCheck = await BotCategory.create({
    name: 'Dependency & Security Check',
});

const issuePrManagement = await BotCategory.create({
    name: 'Issue & PR Management',
});

const documentation = await BotCategory.create({
    name: 'Documentation',
});

function getBotCategoryFromColumnNumber(number)
{
    switch (number) {
        case 6:
            return ciTaskAssistance;
        case 7:
            return codeReviewAssistance;
        case 8:
            return communityManagement;
        case 9:
            return dependencySecurityCheck;
        case 10:
            return issuePrManagement;
        case 11:
            return documentation;
        default:
            return null;
    }
}

fs.createReadStream('./bots.csv')
    .pipe(parse({
        delimiter: ',',
        from_line: 2,
    }))
    .on('data', (row) => {
        const names = row[0].replace(/[\[\]]/g, '').split(',').map((name) => {
            return name.replace(/'/g, '').trim();
        });

        names.forEach(async (name) => {
            const bot = await Bot.create({
                name: name,
            });

            for (let i = 6; i < 12; i++) {
                const botCategory = getBotCategoryFromColumnNumber(i);

                if (botCategory === null) {
                    console.error(`Unknown bot category for column number ${i}`);
                    continue;
                }

                if (row[i] === 'True') {
                    BotCategoryPivot.create({
                        botId: bot.id,
                        botCategoryId: botCategory.id,
                    });
                }
            }
        });
    });
