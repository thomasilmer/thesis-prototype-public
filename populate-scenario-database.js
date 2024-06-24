import {
    Repository,
    RepositoryPopulationJob,
    RepositoryPopulationJobStatus
} from './database/definitions/repositories.js';
import {issue, pullRequest} from './database/factories/issues.js';
import {commit} from './database/factories/commits.js';
import {comment} from './database/factories/comments.js';
import {Issue, IssueType} from './database/definitions/issues.js';
import {Commit} from './database/definitions/commits.js';
import {Comment} from './database/definitions/comments.js';

function between(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function today() {
    const date = new Date();

    date.setHours(0, 0, 0, 0)

    return date;
}

function daysAgo(number) {
    const date = new Date();
    const day = date.getDate();

    date.setHours(between(0, 23));
    date.setMinutes(between(0, 59));
    date.setSeconds(between(0, 59));
    date.setMilliseconds(between(0, 999));
    date.setDate(day - number);

    return date;
}

const issueBot = 'issue-bot';
const prBot = 'pr-bot';
const stale = 'stale[bot]';
const dependabot = 'dependabot[bot]';
const githubActions = 'github-actions[bot]';

console.info(`Setting up scenario 1...`);
await setupScenario1();
console.log(`Finished setting up scenario.`);

console.info(`Setting up scenario 2...`);
await setupScenario2();
console.log(`Finished setting up scenario.`);

console.info(`Setting up scenario 3...`);
await setupScenario3();
console.log(`Finished setting up scenario.`);

async function setupScenario1() {
    const scenario1 = await Repository.create({
        owner: 'thomasilmer',
        repo: 'harmony',
        latestPopulationAt: null,
        isFake: true,
    });

    const job = await RepositoryPopulationJob.create({
        repositoryId: scenario1.id,
        status: RepositoryPopulationJobStatus.DOWNLOADING,
        startedAt: Date.now(),
    });

    const issues = [];
    const commits = [
        commit().for(scenario1).byBot(daysAgo(59), 'harmony-bot'),
        commit().for(scenario1).byBot(daysAgo(59), 'harmony-bot'),
        commit().for(scenario1).byBot(daysAgo(59), 'harmony-bot'),
        commit().for(scenario1).byBot(daysAgo(58), 'harmony-bot'),
    ];

    for (let i = 90; i >= 0; i--) {
        const amount = between(1, 4);

        for (let j = 0; j < amount; j++) {
            const pr = pullRequest()
                .for(scenario1)
                .openedByHuman(daysAgo(i))
                .withComments(between(1, 3) + (i === 17 ? 0 : 1));

            const random = Math.random();

            if (random <= 0.1) { // 10%
                const closed = i - between(0, 14);

                if (closed >= 0) {
                    pr.closedByHuman(daysAgo(closed));
                }
            } else if (random <= 0.5) { // 40%
                const closed = i - between(1, 14);

                if (closed >= 0) {
                    pr.mergedByHuman(daysAgo(closed));
                }
            }

            issues.push(pr);

            commits.push(
                commit().for(scenario1).byHuman(daysAgo(i + 1)),
                commit().for(scenario1).byHuman(daysAgo(i + 1)),
            )
        }
    }

    for (let i = 90; i >= 0; i--) {
        const amount = between(1, 8);

        for (let j = 0; j < amount; j++) {
            const thread = issue()
                .for(scenario1)
                .openedByHuman(daysAgo(i))
                .withComments(between(1, 3) + (i === 17 ? 0 : 1));

            issues.push(thread);
        }
    }

    console.log(`    Saving all issues...`);
    await Issue.bulkCreate(issues.sort((a, b) => a._openedAt - b._openedAt).map((issue) => issue.toModel())).then((created) => {
        const comments = [];

        created.forEach((issue) => {
            const values = issue.dataValues;
            let numberOfComments = issue.dataValues.numberOfComments;

            const openedOn = new Date(issue.dataValues.openedAt.getTime());
            openedOn.setHours(0, 0, 0, 0);
            const openedAgo = Math.round((today().getTime() - openedOn.getTime()) / (1000 * 3600 * 24));

            const isMalfunctioningDay = openedAgo === 17;

            if (values.type === IssueType.ISSUE && ! isMalfunctioningDay) {
                const commented = values.openedAt.getTime() + (between(1, 5) * 1000);

                comments.push(
                    comment()
                        .for(scenario1)
                        .on(issue)
                        .byBot(commented, issueBot)
                        .setBody('Make sure you provide steps to reproduce your issue in detail.'),
                );

                numberOfComments--;
            }

            if (values.type === IssueType.PULL_REQUEST && ! isMalfunctioningDay) {
                const commented = values.openedAt.getTime() + (between(1, 5) * 1000);

                comments.push(
                    comment()
                        .for(scenario1)
                        .on(issue)
                        .byBot(commented, prBot)
                        .setBody('Do not forget to follow our code guidelines. They can be found on the repository main page.'),
                );

                numberOfComments--;
            }

            for (let i = 0; i < numberOfComments; i++) {
                const commented = values.openedAt.getTime() - between(1000, 604800000);

                if (commented >= 0) {
                    comments.push(
                        comment()
                            .for(scenario1)
                            .on(issue)
                            .byHuman(commented),
                    );
                }
            }
        });

        console.log(`    Saving all comments...`);
        return Comment.bulkCreate(comments.map((comment) => comment.toModel()));
    });

    console.log(`    Saving all commits...`);
    await Commit.bulkCreate(commits.map((commit) => commit.toModel()));

    await scenario1.update({
        latestPopulationAt: Date.now(),
    });
    await job.update({
        status: RepositoryPopulationJobStatus.COMPLETED,
        completedAt: Date.now(),
    });
}

async function setupScenario2() {
    const scenario2 = await Repository.create({
        owner: 'thomasilmer',
        repo: 'viper',
        latestPopulationAt: null,
        isFake: true,
    });

    const job = await RepositoryPopulationJob.create({
        repositoryId: scenario2.id,
        status: RepositoryPopulationJobStatus.DOWNLOADING,
        startedAt: Date.now(),
    });

    const issues = [];
    const commits = [];

    const amounts = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // This row is not shown in the graphs
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // This row is not shown in the graphs
        10, 11, 11, 10, 10, 11, 9, 11, 10, 10, // This row is not shown in the graphs
        10, 11, 11, 10, 10, 11, 9, 11, 10, 10,
        10, 10, 11, 9, 11, 10, 10, 11, 11, 10, // Bot introduced here
        9, 9, 8, 9, 8, 10, 9, 9, 8, 9,
        7, 6, 7, 7, 7, 8, 7, 8, 7, 7,
        5, 6, 6, 5, 5, 6, 4, 6, 5, 5,
        4, 4, 5, 3, 5, 4, 4, 5, 5, 4,
    ].reverse();
    for (let i = amounts.length; i >= 0; i--) {
        const closedDays = Math.min(i - 14, 40);

        const prAmount = amounts[i];

        for (let j = 0; j < prAmount; j++) {
            const pr = pullRequest()
                .for(scenario2)
                .openedByHuman(daysAgo(i))
                .withComments(between(1, 3));

            const random = Math.random();

            if (random <= 0.4 && closedDays >= 0) { // 40%
                pr.closedByBot(daysAgo(closedDays).setHours(13, 37), stale).withComments(between(1, 3) + 1);
            } else if (random <= 0.5) { // 10%
                const closed = i - between(0, 7);

                if (closed >= 0) {
                    pr.closedByHuman(daysAgo(closed));
                }
            } else if (random <= 0.9) { // 40%
                const closed = i - between(0, 7);

                if (closed >= 0) {
                    pr.mergedByHuman(daysAgo(closed));
                }
            }

            issues.push(pr);

            commits.push(
                commit().for(scenario2).byHuman(daysAgo(i + 1)),
                commit().for(scenario2).byHuman(daysAgo(i + 1)),
            )
        }

        const issueAmount = Math.max(between(1, 20) - amounts[i], 0);

        for (let j = 0; j < issueAmount; j++) {
            const thread = issue()
                .for(scenario2)
                .openedByHuman(daysAgo(i))
                .withComments(between(1, 3));

            issues.push(thread);
        }
    }

    console.log(`    Saving all issues...`);
    await Issue.bulkCreate(issues.sort((a, b) => a._openedAt - b._openedAt).map((issue) => issue.toModel())).then((created) => {
        const comments = [];

        created.forEach((issue) => {
            const values = issue.dataValues;
            let numberOfComments = issue.dataValues.numberOfComments;

            if (values.type === IssueType.PULL_REQUEST && values.closerIsBot) {
                const commented = values.closedAt.getTime() - 1;

                comments.push(
                    comment()
                        .for(scenario2)
                        .on(issue)
                        .byBot(commented, stale)
                        .setBody('Your pull request was automatically closed due to inactivity for 14 days!'),
                );

                numberOfComments--;
            }

            for (let i = 0; i < numberOfComments; i++) {
                const commented = values.openedAt.getTime() - between(1000, 604800000);

                if (commented >= 0) {
                    comments.push(
                        comment()
                            .for(scenario2)
                            .on(issue)
                            .byHuman(commented),
                    );
                }
            }
        });

        console.log(`    Saving all comments...`);
        return Comment.bulkCreate(comments.map((comment) => comment.toModel()));
    });

    console.log(`    Saving all commits...`);
    await Commit.bulkCreate(commits.map((commit) => commit.toModel()));

    await scenario2.update({
        latestPopulationAt: Date.now(),
    });
    await job.update({
        status: RepositoryPopulationJobStatus.COMPLETED,
        completedAt: Date.now(),
    });
}

async function setupScenario3() {
    const scenario3 = await Repository.create({
        owner: 'thomasilmer',
        repo: 'koalas',
        latestPopulationAt: null,
        isFake: true,
    });

    const job = await RepositoryPopulationJob.create({
        repositoryId: scenario3.id,
        status: RepositoryPopulationJobStatus.DOWNLOADING,
        startedAt: Date.now(),
    });

    const issues = [];
    const commits = [];

    for (let i = 90; i >= 0; i--) {
        const prAmount = between(0, 2);

        for (let j = 0; j < prAmount; j++) {
            const pr = pullRequest()
                .for(scenario3)
                .openedByHuman(daysAgo(i))
                .withComments(between(0, 2));

            const random = Math.random();

            if (random <= 0.2) { // 20%
                const closed = i - between(0, 7);

                if (closed >= 0) {
                    pr.closedByHuman(daysAgo(closed));
                }
            } else if (random <= 0.6) { // 40%
                const closed = i - between(0, 7);

                if (closed >= 0) {
                    pr.mergedByHuman(daysAgo(closed));
                }
            }

            issues.push(pr);

            commits.push(
                commit().for(scenario3).byHuman(daysAgo(i + 1)),
                commit().for(scenario3).byHuman(daysAgo(i + 1)),
            )
        }

        const issueAmount = between(0, 2);

        for (let j = 0; j < issueAmount; j++) {
            const thread = issue()
                .for(scenario3)
                .openedByHuman(daysAgo(i))
                .withComments(between(0, 3));

            issues.push(thread);
        }

        let dependabotAmount = between(6, 18);
        let merged = 0.8;

        if (i > 50) {
            dependabotAmount = 0;
        }

        if (i <= 13) {
            dependabotAmount = 1;
            merged = 0.2;
        }

        for (let j = 0; j < dependabotAmount; j++) {
            const submittedAt = daysAgo(i).setHours(12, 0, 0, 0);
            const pr = pullRequest()
                .for(scenario3)
                .openedByBot(submittedAt, dependabot)
                .setTitle('Update dependencies [x, y, z]')
                .withComments(between(0, 1));

            const random = Math.random();

            if (random <= merged) { // 20% or 80%
                const closed = i - between(0, 2);

                if (closed >= 0) {
                    pr.mergedByHuman(daysAgo(closed));
                }
            } else if (random <= 0.9) { // 70% or 10%
                const closed = i - between(0, 2);

                if (closed >= 0) {
                    pr.closedByHuman(daysAgo(closed));
                }
            }

            issues.push(pr);

            commits.push(
                commit().for(scenario3).byBot(submittedAt, dependabot).setMessage('Update dependencies'),
            )
        }

        let githubActionsAmount = between(1, 5);

        if (i > 50) {
            githubActionsAmount = 0;
        }

        for (let j = 0; j < githubActionsAmount; j++) {
            const thread = issue()
                .for(scenario3)
                .openedByBot(daysAgo(i), githubActions)
                .setTitle('[Autotest] Exception [x] encountered in file [y] on line [z]')
                .withComments(between(1, 3));

            const random = Math.random();

            if (random <= 0.8) { // 80%
                const closed = i - between(1, 7);

                if (closed >= 0) {
                    thread.closedByHuman(daysAgo(closed));
                }
            }

            issues.push(thread);
        }
    }

    console.log(`    Saving all issues...`);
    await Issue.bulkCreate(issues.sort((a, b) => a._openedAt - b._openedAt).map((issue) => issue.toModel())).then((created) => {
        const comments = [];

        created.forEach((issue) => {
            const values = issue.dataValues;
            let numberOfComments = issue.dataValues.numberOfComments;

            for (let i = 0; i < numberOfComments; i++) {
                const commented = values.openedAt.getTime() - between(1000, 604800000);

                if (commented >= 0) {
                    comments.push(
                        comment()
                            .for(scenario3)
                            .on(issue)
                            .byHuman(commented),
                    );
                }
            }
        });

        console.log(`    Saving all comments...`);
        return Comment.bulkCreate(comments.map((comment) => comment.toModel()));
    });

    console.log(`    Saving all commits...`);
    await Commit.bulkCreate(commits.map((commit) => commit.toModel()));

    await scenario3.update({
        latestPopulationAt: Date.now(),
    });
    await job.update({
        status: RepositoryPopulationJobStatus.COMPLETED,
        completedAt: Date.now(),
    });
}
