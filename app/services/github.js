import * as dotenv from 'dotenv';
import {Octokit} from '@octokit/rest';
import {
    Repository,
    RepositoryPopulationJob,
    RepositoryPopulationJobStatus
} from '../../database/definitions/repositories.js';
import {Bot} from '../../database/definitions/bots.js';
import {Issue, IssueType} from '../../database/definitions/issues.js';
import {Commit} from '../../database/definitions/commits.js';
import {Comment} from '../../database/definitions/comments.js';
import {Op} from 'sequelize';
import connection from '../../database/connection.js';
import asyncPool from 'tiny-async-pool';

dotenv.config();

const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN,
    userAgent: 'GitHub Bot Insights',
    timeZone: 'Etc/UTC',
    baseUrl: 'https://api.github.com',
    throttle: {
        onRateLimit: (retryAfter, options) => {
        },
        onSecondaryRateLimit: (retryAfter, options, octokit) => {
        },
    },
    log: {
        debug: () => {
        },
        info: () => {
        },
        warn: console.warn,
        error: console.error,
    },
    request: {
        agent: undefined,
        fetch: undefined,
        timeout: 0,
    },
});

export const bots = await Bot.findAll();
export const botNames = bots.map(bot => bot.name);

export function detectBotFromName(name) {
    name = name.toLowerCase();

    return name.includes('[bot]') ||
        name.startsWith('bot-') ||
        name.startsWith('robot-') ||
        name.endsWith('-bot') ||
        name.endsWith('-robot') ||
        name.includes('-bot-') ||
        name.includes('-robot-') ||
        botNames.some((botName) => name.includes(botName));
}

export async function getRepository(owner, repo) {
    let repository = await Repository.findOne({
        where: {
            owner: owner,
            repo: repo,
        },
    });

    if (repository === null) {
        const repositorySearchResponse = await octokit.rest.repos.get({
            owner: owner,
            repo: repo,
        });

        repository = await Repository.create({
            owner: owner,
            repo: repo,
            language: repositorySearchResponse.data.language,
            defaultBranch: repositorySearchResponse.data.default_branch,
        });

        console.info(`Registered new repository ${repository.owner}/${repository.repo}`);
    }

    return repository;
}

export async function repopulateRepository(repository, daysBack = 90) {
    const job = await RepositoryPopulationJob.create({
        repositoryId: repository.id,
        status: RepositoryPopulationJobStatus.DOWNLOADING,
        startedAt: Date.now(),
    });

    if (repository.isFake) {
        const difference = Math.floor((Date.now() - repository.latestPopulationAt.getTime()) / 1000 / 3600 / 24);

        await connection.query(`
            UPDATE issues
            SET openedAt = DATETIME(openedAt, '+${difference} days'),
                mergedAt = IIF(mergedAt IS NULL, NULL, DATETIME(mergedAt, '+${difference} days')),
                closedAt = IIF(closedAt IS NULL, null, DATETIME(closedAt, '+${difference} days'))
            WHERE repositoryId = :repositoryId
        `, {
            replacements: {
                repositoryId: repository.id,
            },
        });

        await connection.query(`
            UPDATE commits
            SET committedAt = DATETIME(committedAt, '+${difference} days')
            WHERE repositoryId = :repositoryId
        `, {
            replacements: {
                repositoryId: repository.id,
            },
        });

        await connection.query(`
            UPDATE comments
            SET commentedAt = DATETIME(commentedAt, '+${difference} days')
            WHERE repositoryId = :repositoryId
        `, {
            replacements: {
                repositoryId: repository.id,
            },
        });

        await repository.update({
            latestPopulationAt: repository.latestPopulationAt.getTime() + (1000 * 3600 * 24 * difference),
        });
        await job.update({
            status: RepositoryPopulationJobStatus.COMPLETED,
            completedAt: Date.now(),
        });

        return;
    }

    let shouldRollback = false;
    let isRateLimitReached = false;

    const onCommentableSaved =  async function (created) {
        const commentables = created
            .filter((commentable) => commentable.numberOfComments > 0)
            .map((commentable) => commentable.dataValues);

        const fetch = async function (commentable) {
            return await fetchIssueComments(repository, commentable);
        };

        for await (const comment of asyncPool(3, commentables, fetch)) {}

        console.info(`Completed download for ${repository.owner}/${repository.repo} comments.`);
    };

    const onError = async function (error) {
        if (shouldRollback) {
            return;
        }

        shouldRollback = true;

        if (error.status === 403 || error.status === 429) {
            isRateLimitReached = true;
            console.error(`Rate limited reached while repopulating ${repository.owner}/${repository.repo}.`);
        } else {
            console.error(`Fatal exception while repopulating ${repository.owner}/${repository.repo}.`);
            console.error(error);
        }
    };

    await Promise.all([
        fetchIssues(repository, daysBack).then(onCommentableSaved).catch(onError),
        fetchCommits(repository, daysBack).catch(onError),
    ]);

    if (!shouldRollback) {
        await repository.update({
            latestPopulationAt: Date.now(),
        });
    } else {
        await rollbackRepository(repository, repository.latestPopulationAt);
    }

    const status = shouldRollback ? (isRateLimitReached ? RepositoryPopulationJobStatus.STALLED : RepositoryPopulationJobStatus.CANCELED) : RepositoryPopulationJobStatus.COMPLETED;

    await job.update({
        status: status,
        completedAt: Date.now(),
    });
}

export async function rollbackRepository(repository, datetime) {
    await Commit.destroy({
        where: {
            repositoryId: repository.id,
            committedAt: {
                [Op.gt]: datetime,
            },
        },
    });

    await Comment.destroy({
        where: {
            repositoryId: repository.id,
            commentedAt: {
                [Op.gt]: datetime,
            },
        },
    });

    await Issue.destroy({
        where: {
            repositoryId: repository.id,
            openedAt: {
                [Op.gt]: datetime,
            },
        },
    });
}

export async function fetchIssues(repository, daysBack) {
    console.info(`Started download for ${repository.owner}/${repository.repo} issues.`);

    const date = new Date();
    date.setDate(date.getDate() - daysBack);

    const issuesIterator = octokit.paginate.iterator('GET /repos/{owner}/{repo}/issues', {
        owner: repository.owner,
        repo: repository.repo,
        sort: 'created',
        direction: 'desc',
        state: 'all',
        since: date.toISOString(),
        per_page: 100,
    });

    const issues = [];
    let shouldStop = false

    for await (const response of issuesIterator) {
        response.data.forEach((issue) => {
            const type = typeof issue.pull_request === 'undefined' ? IssueType.ISSUE : IssueType.PULL_REQUEST;

            const createdAt = Date.parse(issue.created_at);

            if (createdAt < date || createdAt < repository.latestPopulationAt) {
                shouldStop = true

                return;
            }

            const openedBy = issue.user.login;
            const isOpenerBot = issue.user.type !== 'User' || detectBotFromName(openedBy);

            let closedBy = null;
            let isCloserBot = null;

            if (typeof issue.closed_by !== 'undefined') {
                closedBy = issue.closed_by.login;
                isCloserBot = issue.closed_by.type !== 'User' || detectBotFromName(closedBy);
            }

            const mergedAt = type === IssueType.PULL_REQUEST ? issue.pull_request.merged_at : null;
            const closedAt = mergedAt === null ? issue.closed_at : null;

            issues.push({
                repositoryId: repository.id,
                openedBy: openedBy,
                openerIsBot: isOpenerBot,
                closedBy: closedBy,
                closerIsBot: isCloserBot,
                number: issue.number,
                title: issue.title,
                url: issue.html_url,
                type: type,
                numberOfComments: issue.comments,
                openedAt: issue.created_at,
                mergedAt: mergedAt,
                closedAt: closedAt,
            });
        });

        if (shouldStop) {
            break;
        }
    }

    console.info(`Completed download for ${repository.owner}/${repository.repo} issues.`);

    return Issue.bulkCreate(issues);
}

export async function fetchIssueComments(repository, issue) {
    const commentsIterator = octokit.paginate.iterator(octokit.rest.issues.listComments, {
        owner: repository.owner,
        repo: repository.repo,
        issue_number: issue.number,
        per_page: 100,
    });

    const comments = []

    for await (const response of commentsIterator) {
        response.data.forEach((comment) => {
            const username = comment.user.login;
            const isBot = comment.user.type !== 'User' || detectBotFromName(comment.user.login);

            comments.push({
                repositoryId: repository.id,
                issueId: issue.id,
                user: username,
                isBot: isBot,
                body: comment.body,
                url: comment.html_url,
                commentedAt: comment.created_at,
            });
        });
    }

    return Comment.bulkCreate(comments);
}

export async function fetchCommits(repository, daysBack) {
    console.info(`Started download for ${repository.owner}/${repository.repo} commits.`);

    const date = new Date();
    date.setDate(date.getDate() - daysBack);

    const commitsIterator = octokit.paginate.iterator(octokit.rest.repos.listCommits, {
        owner: repository.owner,
        repo: repository.repo,
        sort: 'created',
        direction: 'desc',
        since: date.toISOString(),
        per_page: 100,
    });

    const commits = [];
    let shouldStop = false

    for await (const response of commitsIterator) {
        response.data.forEach((commit) => {
            const createdAt = Date.parse(commit.commit.author.date);

            if (createdAt < date || createdAt < repository.latestPopulationAt) {
                shouldStop = true

                return;
            }

            const username = commit.author !== null ? commit.author.login : ('Anonymous: ' + commit.commit.author.name);
            const isBot = commit.author !== null && (commit.author.type !== 'User' || detectBotFromName(commit.author.login)) || detectBotFromName(commit.commit.author.name);

            commits.push({
                repositoryId: repository.id,
                user: username,
                isBot: isBot,
                hash: commit.sha,
                message: commit.commit.message,
                url: commit.html_url,
                committedAt: commit.commit.author.date,
            });
        });

        if (shouldStop) {
            break;
        }
    }

    console.info(`Completed download for ${repository.owner}/${repository.repo} commits.`);

    return Commit.bulkCreate(commits);
}
