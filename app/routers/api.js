import express from 'express';
import connection from '../../database/connection.js';
import {Repository, RepositoryPopulationJob} from '../../database/definitions/repositories.js';
import {IssueType} from '../../database/definitions/issues.js';
import {Bootstrap} from '../frontend/helpers/colors.js';

const router = express.Router();

router.use(express.json());

function getAnnotations(owner, repo) {
    if (owner !== 'thomasilmer') {
        return {};
    }

    if (repo === 'harmony') {
        const date = (new Date());
        date.setDate(date.getDate() - 17);
        date.setHours(12);

        return {
            bots_changed: {
                type: 'line',
                scaleID: 'x',
                value: date.toLocaleString(
                    'en',
                    {weekday: 'short', month: 'short', day: 'numeric'},
                ),
                borderColor: Bootstrap.colors.warning(0.5),
                borderWidth: 1,
                label: {
                    backgroundColor: Bootstrap.colors.warning(0.5),
                    color: 'rgb(255, 255, 255, 0.75)',
                    content: ['issue-bot config changed 2x', 'pr-bot config changed 2x'],
                    display: true,
                },
            },
        };
    }

    if (repo === 'viper') {
        const date = (new Date());
        date.setDate(date.getDate() - 40);
        date.setHours(13, 37);

        return {
            bots_added: {
                type: 'line',
                scaleID: 'x',
                value: date.toLocaleString(
                    'en',
                    {weekday: 'short', month: 'short', day: 'numeric'},
                ),
                borderColor: Bootstrap.colors.success(0.5),
                borderWidth: 1,
                label: {
                    backgroundColor: Bootstrap.colors.success(0.5),
                    color: 'rgb(255, 255, 255, 0.75)',
                    content: ['stale[bot] added'],
                    display: true,
                },
            },
        };
    }

    if (repo === 'koalas') {
        const date1 = (new Date());
        date1.setDate(date1.getDate() - 50);
        date1.setHours(12);

        const date2 = (new Date());
        date2.setDate(date2.getDate() - 13);
        date2.setHours(12);

        return {
            bots_added: {
                type: 'line',
                scaleID: 'x',
                value: date1.toLocaleString(
                    'en',
                    {weekday: 'short', month: 'short', day: 'numeric'},
                ),
                borderColor: Bootstrap.colors.success(0.5),
                borderWidth: 1,
                label: {
                    backgroundColor: Bootstrap.colors.success(0.5),
                    color: 'rgb(255, 255, 255, 0.75)',
                    content: ['dependabot[bot] added', 'github-actions[bot] added'],
                    display: true,
                },
            },
            bot_changed: {
                type: 'line',
                scaleID: 'x',
                value: date2.toLocaleString(
                    'en',
                    {weekday: 'short', month: 'short', day: 'numeric'},
                ),
                borderColor: Bootstrap.colors.warning(0.5),
                borderWidth: 1,
                label: {
                    backgroundColor: Bootstrap.colors.warning(0.5),
                    color: 'rgb(255, 255, 255, 0.75)',
                    content: ['dependabot[bot] changed'],
                    display: true,
                },
            },
        };
    }

    return {};
}

router.post('/repository', async (req, res) => {
    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    return res.json({repository});
});

router.post('/repository/repopulation-status', async (req, res) => {
    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    if (repository === null) {
        return res.json({repopulating: false});
    }

    const latestJob = await RepositoryPopulationJob.findOne({
        where: {
            repositoryId: repository.id,
        },
        order: [
            ['startedAt', 'DESC'],
        ],
    });

    if (latestJob === null) {
        return res.json({status: null});
    }

    return res.json({
        status: latestJob.status,
    });
});

router.post('/bot-summary', async (req, res) => {
    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - 27);

    const currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - 13);

    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    if (repository === null) {
        return res.status(404).json({});
    }

    const [results, meta] = await connection.query(`
        WITH actions AS
                 (SELECT issues.id       as id,
                         issues.openedBy as botName,
                         issues.openedAt as happenedAt
                  FROM issues
                  WHERE issues.repositoryId = :repositoryId
                    AND issues.openerIsBot = 1
                  UNION ALL
                  SELECT issues.id       as id,
                         issues.closedBy as botName,
                         issues.closedAt as happenedAt
                  FROM issues
                  WHERE issues.repositoryId = :repositoryId
                    AND issues.closerIsBot = 1
                  UNION ALL
                  SELECT issues.id       as id,
                         issues.closedBy as botName,
                         issues.mergedAt as happenedAt
                  FROM issues
                  WHERE issues.repositoryId = :repositoryId
                    AND issues.closerIsBot = 1
                  UNION ALL
                  SELECT commits.id          as id,
                         commits.user        as botName,
                         commits.committedAt as happenedAt
                  FROM commits
                  WHERE commits.repositoryId = :repositoryId
                    AND commits.isBot = 1
                  UNION ALL
                  SELECT comments.id          as id,
                         comments.user        as botName,
                         comments.commentedAt as happenedAt
                  FROM comments
                  WHERE comments.repositoryId = :repositoryId
                    AND comments.isBot = 1)

        SELECT (SELECT COUNT(actions.id)
                FROM actions
                WHERE actions.happenedAt >= :previousStartDate
                  AND actions.happenedAt < :currentStartDate)  AS previous_bot_action_count,
               (SELECT COUNT(actions.id)
                FROM actions
                WHERE actions.happenedAt >= :currentStartDate) AS current_bot_action_count,
               (SELECT COUNT(DISTINCT actions.botName)
                FROM actions
                WHERE actions.happenedAt >= :previousStartDate
                  AND actions.happenedAt < :currentStartDate)  AS previous_active_bot_count,
               (SELECT COUNT(DISTINCT actions.botName)
                FROM actions
                WHERE actions.happenedAt >= :currentStartDate) AS current_active_bot_count,
               (SELECT COUNT(issues.id)
                FROM issues
                WHERE issues.repositoryId = :repositoryId
                  AND issues.openedAt >= :previousStartDate
                  AND issues.openedAt < :currentStartDate
                  AND issues.type = '${IssueType.PULL_REQUEST}'
                  AND issues.openerIsBot = 1)                  AS previous_pull_request_count,
               (SELECT COUNT(issues.id)
                FROM issues
                WHERE issues.repositoryId = :repositoryId
                  AND issues.openedAt >= :currentStartDate
                  AND issues.type = '${IssueType.PULL_REQUEST}'
                  AND issues.openerIsBot = 1)                  AS current_pull_request_count,
               (SELECT COUNT(issues.id)
                FROM issues
                WHERE issues.repositoryId = :repositoryId
                  AND issues.openedAt >= :previousStartDate
                  AND issues.openedAt < :currentStartDate
                  AND issues.type = '${IssueType.PULL_REQUEST}'
                  AND issues.mergedAt IS NOT NULL
                  AND issues.openerIsBot = 1)                  AS previous_merged_pull_request_count,
               (SELECT COUNT(issues.id)
                FROM issues
                WHERE issues.repositoryId = :repositoryId
                  AND issues.openedAt >= :currentStartDate
                  AND issues.type = '${IssueType.PULL_REQUEST}'
                  AND issues.mergedAt IS NOT NULL
                  AND issues.openerIsBot = 1)                  AS current_merged_pull_request_count
    `, {
        replacements: {
            repositoryId: repository.id,
            previousStartDate: previousStartDate.toISOString().substring(0, 10),
            currentStartDate: currentStartDate.toISOString().substring(0, 10),
        },
    });

    return res.json({results: results[0]});
});

router.post('/bots', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() - 59);

    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    if (repository === null) {
        return res.status(404).json({});
    }

    const [results, meta] = await connection.query(`
        WITH bot_interactions AS (SELECT repositoryId, openedBy AS user, openedAt AS activityAt
                                  FROM issues
                                  WHERE openerIsBot = 1
                                  UNION ALL
                                  SELECT repositoryId, closedBy AS user, mergedAt AS activityAt
                                  FROM issues
                                  WHERE closerIsBot = 1
                                  UNION ALL
                                  SELECT repositoryId, closedBy AS user, closedAt AS activityAt
                                  FROM issues
                                  WHERE closerIsBot = 1
                                  UNION ALL
                                  SELECT repositoryId, user, commentedAt AS activityAt
                                  FROM comments
                                  WHERE isBot = 1
                                  UNION ALL
                                  SELECT repositoryId, user, committedAt AS activityAt
                                  FROM commits
                                  WHERE isBot = 1)

        SELECT user            AS username,
               COUNT(*)        AS interactions,
               MAX(activityAt) AS latestActivityAt
        FROM bot_interactions
        WHERE repositoryId = :repositoryId
          AND activityAt >= :since
        GROUP BY user
        ORDER BY latestActivityAt DESC
    `, {
        replacements: {
            repositoryId: repository.id,
            since: date.toISOString().substring(0, 10),
        },
    });

    return res.json({results});
});

router.post('/active-bots', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() - 12 * 7);

    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    if (repository === null) {
        return res.status(404).json({});
    }

    const [results, meta] = await connection.query(`
        WITH RECURSIVE dates(date) AS (VALUES (:since) UNION ALL SELECT DATE (DATE, '+1 day')
        FROM dates
        WHERE DATE < DATE ('now')), bot_interactions AS (
        SELECT repositoryId, openedBy AS user, openedAt AS activityAt
        FROM issues
        WHERE openerIsBot = 1
        UNION ALL
        SELECT repositoryId, closedBy AS user, mergedAt AS activityAt
        FROM issues
        WHERE closerIsBot = 1
        UNION ALL
        SELECT repositoryId, closedBy AS user, closedAt AS activityAt
        FROM issues
        WHERE closerIsBot = 1
        UNION ALL
        SELECT repositoryId, user, commentedAt AS activityAt
        FROM comments
        WHERE isBot = 1
        UNION ALL
        SELECT repositoryId, user, committedAt AS activityAt
        FROM commits
        WHERE isBot = 1), week_counts AS (
        SELECT COUNT (DISTINCT bot_interactions.user) AS botCount, strftime('%W', bot_interactions.activityAt) AS week
        FROM bot_interactions
        WHERE bot_interactions.repositoryId = :repositoryId
        GROUP BY strftime('%W', activityAt))

        SELECT strftime('%W', dates.date)        AS week,
               COALESCE(week_counts.botCount, 0) AS botCount
        FROM dates
                 LEFT JOIN week_counts ON week_counts.week = strftime('%W', dates.date)
        GROUP BY strftime('%W', dates.date)
        ORDER BY dates.date
    `, {
        replacements: {
            repositoryId: repository.id,
            since: date.toISOString().substring(0, 10),
        },
    });

    return res.json({results});
});

router.post('/bot-actions', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() - 59);

    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    if (repository === null) {
        return res.status(404).json({});
    }

    const [results, meta] = await connection.query(`
        WITH bot_interactions AS (SELECT repositoryId, openedBy AS user, issues.type AS type, openedAt AS activityAt
                                  FROM issues
                                  WHERE openerIsBot = 1
                                  UNION ALL
                                  SELECT repositoryId, closedBy AS user, issues.type AS type, mergedAt AS activityAt
                                  FROM issues
                                  WHERE closerIsBot = 1
                                  UNION ALL
                                  SELECT repositoryId, closedBy AS user, issues.type AS type, closedAt AS activityAt
                                  FROM issues
                                  WHERE closerIsBot = 1
                                  UNION ALL
                                  SELECT repositoryId, user, 'comment' AS type, commentedAt AS activityAt
                                  FROM comments
                                  WHERE isBot = 1
                                  UNION ALL
                                  SELECT repositoryId, user, 'commit' AS type, committedAt AS activityAt
                                  FROM commits
                                  WHERE isBot = 1)

        SELECT user     AS username,
               type     AS type,
               COUNT(*) AS interactions
        FROM bot_interactions
        WHERE repositoryId = :repositoryId
          AND activityAt >= :since
        GROUP BY user, type
        ORDER BY interactions DESC
    `, {
        replacements: {
            repositoryId: repository.id,
            since: date.toISOString().substring(0, 10),
        },
    });

    return res.json({results});
});

router.post('/issues', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() - 59);

    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    if (repository === null) {
        return res.status(404).json({});
    }

    const [results, meta] = await connection.query(`
        WITH RECURSIVE dates(date) AS (VALUES (:since) UNION ALL SELECT DATE (DATE, '+1 day')
        FROM dates
        WHERE DATE < DATE ('now'))

        SELECT 'closed'         AS transitionType,
               dates.date       AS transitionOn,
               COUNT(issues.id) AS transitionCount
        FROM dates
                 LEFT JOIN issues ON DATE (issues.closedAt) = dates.date AND issues.type = :issueType AND issues.repositoryId = :repositoryId AND issues.openerIsBot = 1
        GROUP BY dates.date
        UNION ALL
        SELECT 'opened'         AS transitionType,
               dates.date       AS transitionOn,
               COUNT(issues.id) AS transitionCount
        FROM dates
                 LEFT JOIN issues ON DATE (issues.openedAt) = dates.date AND issues.type = :issueType AND issues.repositoryId = :repositoryId AND issues.openerIsBot = 1
        GROUP BY dates.date
        ORDER BY transitionType, transitionOn
    `, {
        replacements: {
            repositoryId: repository.id,
            since: date.toISOString().substring(0, 10),
            issueType: IssueType.ISSUE,
        },
    });

    return res.json({
        results: results,
        annotations: getAnnotations(repository.owner, repository.repo),
    });
});

router.post('/pull-requests', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() - 59);

    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    if (repository === null) {
        return res.status(404).json({});
    }

    const [results, meta] = await connection.query(`
        WITH RECURSIVE dates(date) AS (VALUES (:since) UNION ALL SELECT DATE (DATE, '+1 day')
        FROM dates
        WHERE DATE < DATE ('now'))

        SELECT 'closed'         AS transitionType,
               dates.date       AS transitionOn,
               COUNT(issues.id) AS transitionCount
        FROM dates
                 LEFT JOIN issues ON DATE (issues.closedAt) = dates.date AND issues.type = :issueType AND issues.repositoryId = :repositoryId AND issues.openerIsBot = 1 AND mergedAt IS NULL
        GROUP BY dates.date
        UNION ALL
        SELECT 'merged'         AS transitionType,
               dates.date       AS transitionOn,
               COUNT(issues.id) AS transitionCount
        FROM dates
                 LEFT JOIN issues ON DATE (issues.mergedAt) = dates.date AND issues.type = :issueType AND issues.repositoryId = :repositoryId AND issues.openerIsBot = 1
        GROUP BY dates.date
        UNION ALL
        SELECT 'opened'         AS transitionType,
               dates.date       AS transitionOn,
               COUNT(issues.id) AS transitionCount
        FROM dates
                 LEFT JOIN issues ON DATE (issues.openedAt) = dates.date AND issues.type = :issueType AND issues.repositoryId = :repositoryId AND issues.openerIsBot = 1
        GROUP BY dates.date
        ORDER BY transitionType, transitionOn
    `, {
        replacements: {
            repositoryId: repository.id,
            since: date.toISOString().substring(0, 10),
            issueType: IssueType.PULL_REQUEST,
        },
    });

    return res.json({
        results: results,
        annotations: getAnnotations(repository.owner, repository.repo),
    });
});

router.post('/issues-closed', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() - 59);

    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    if (repository === null) {
        return res.status(404).json({});
    }

    const [results, meta] = await connection.query(`
        WITH RECURSIVE dates(date) AS (VALUES (:since) UNION ALL SELECT DATE (DATE, '+1 day')
        FROM dates
        WHERE DATE < DATE ('now'))

        SELECT 'closed'         AS transitionType,
               dates.date       AS transitionOn,
               COUNT(issues.id) AS transitionCount
        FROM dates
                 LEFT JOIN issues ON DATE (issues.closedAt) = dates.date AND issues.type = :issueType AND issues.repositoryId = :repositoryId AND issues.closerIsBot = 1
        GROUP BY dates.date
        ORDER BY transitionType, transitionOn
    `, {
        replacements: {
            repositoryId: repository.id,
            since: date.toISOString().substring(0, 10),
            issueType: IssueType.ISSUE,
        },
    });

    return res.json({
        results: results,
        annotations: getAnnotations(repository.owner, repository.repo),
    });
});

router.post('/pull-requests-closed', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() - 59);

    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    if (repository === null) {
        return res.status(404).json({});
    }

    const [results, meta] = await connection.query(`
        WITH RECURSIVE dates(date) AS (VALUES (:since) UNION ALL SELECT DATE (DATE, '+1 day')
        FROM dates
        WHERE DATE < DATE ('now'))

        SELECT 'closed'         AS transitionType,
               dates.date       AS transitionOn,
               COUNT(issues.id) AS transitionCount
        FROM dates
                 LEFT JOIN issues ON DATE (issues.closedAt) = dates.date AND issues.type = :issueType AND issues.repositoryId = :repositoryId AND issues.closerIsBot = 1
        GROUP BY dates.date
        UNION ALL
        SELECT 'merged'         AS transitionType,
               dates.date       AS transitionOn,
               COUNT(issues.id) AS transitionCount
        FROM dates
                 LEFT JOIN issues ON DATE (issues.mergedAt) = dates.date AND issues.type = :issueType AND issues.repositoryId = :repositoryId AND issues.closerIsBot = 1
        GROUP BY dates.date
        ORDER BY transitionType, transitionOn
    `, {
        replacements: {
            repositoryId: repository.id,
            since: date.toISOString().substring(0, 10),
            issueType: IssueType.PULL_REQUEST,
        },
    });

    return res.json({
        results: results,
        annotations: getAnnotations(repository.owner, repository.repo),
    });
});

router.post('/comparison/issues', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() - 59);

    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    if (repository === null) {
        return res.status(404).json({});
    }

    const [results, meta] = await connection.query(`
        WITH RECURSIVE dates(date) AS (VALUES (:since) UNION ALL SELECT DATE (DATE, '+1 day')
        FROM dates
        WHERE DATE < DATE ('now'))

        SELECT 'human'          AS userType,
               dates.date       AS openedOn,
               COUNT(issues.id) AS issueCount
        FROM dates
                 LEFT JOIN issues ON DATE (issues.openedAt) = dates.date AND issues.type = :issueType AND issues.repositoryId = :repositoryId AND issues.openerIsBot = 0
        GROUP BY dates.date
        UNION ALL
        SELECT 'bot'            AS userType,
               dates.date       AS openedOn,
               COUNT(issues.id) AS issueCount
        FROM dates
                 LEFT JOIN issues ON DATE (issues.openedAt) = dates.date AND issues.type = :issueType AND issues.repositoryId = :repositoryId AND issues.openerIsBot = 1
        GROUP BY dates.date
        ORDER BY userType, openedOn
    `, {
        replacements: {
            repositoryId: repository.id,
            since: date.toISOString().substring(0, 10),
            issueType: IssueType.ISSUE,
        },
    });

    return res.json({
        results: results,
        annotations: getAnnotations(repository.owner, repository.repo),
    });
});

router.post('/comparison/pull-requests', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() - 59);

    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    if (repository === null) {
        return res.status(404).json({});
    }

    const [results, meta] = await connection.query(`
        WITH RECURSIVE dates(date) AS (VALUES (:since) UNION ALL SELECT DATE (DATE, '+1 day')
        FROM dates
        WHERE DATE < DATE ('now'))

        SELECT 'human'          AS userType,
               dates.date       AS openedOn,
               COUNT(issues.id) AS issueCount
        FROM dates
                 LEFT JOIN issues ON DATE (issues.openedAt) = dates.date AND issues.type = :issueType AND issues.repositoryId = :repositoryId AND issues.openerIsBot = 0
        GROUP BY dates.date
        UNION ALL
        SELECT 'bot'            AS userType,
               dates.date       AS openedOn,
               COUNT(issues.id) AS issueCount
        FROM dates
                 LEFT JOIN issues ON DATE (issues.openedAt) = dates.date AND issues.type = :issueType AND issues.repositoryId = :repositoryId AND issues.openerIsBot = 1
        GROUP BY dates.date
        ORDER BY userType, openedOn
    `, {
        replacements: {
            repositoryId: repository.id,
            since: date.toISOString().substring(0, 10),
            issueType: IssueType.PULL_REQUEST,
        },
    });

    return res.json({
        results: results,
        annotations: getAnnotations(repository.owner, repository.repo),
    });
});

router.post('/comparison/pull-requests-merged', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() - 59);

    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    if (repository === null) {
        return res.status(404).json({});
    }

    const [results, meta] = await connection.query(`
        WITH RECURSIVE dates(date) AS (VALUES (:since) UNION ALL SELECT DATE (DATE, '+1 day')
        FROM dates
        WHERE DATE < DATE ('now'))

        SELECT 'human'          AS userType,
               dates.date       AS mergedOn,
               COUNT(issues.id) AS issueCount
        FROM dates
                 LEFT JOIN issues ON DATE (issues.mergedAt) = dates.date AND issues.type = :issueType AND issues.repositoryId = :repositoryId AND issues.openerIsBot = 0
        GROUP BY dates.date
        UNION ALL
        SELECT 'bot'            AS userType,
               dates.date       AS mergedOn,
               COUNT(issues.id) AS issueCount
        FROM dates
                 LEFT JOIN issues ON DATE (issues.mergedAt) = dates.date AND issues.type = :issueType AND issues.repositoryId = :repositoryId AND issues.openerIsBot = 1
        GROUP BY dates.date
        ORDER BY userType, mergedOn
    `, {
        replacements: {
            repositoryId: repository.id,
            since: date.toISOString().substring(0, 10),
            issueType: IssueType.PULL_REQUEST,
        },
    });

    return res.json({
        results: results,
        annotations: getAnnotations(repository.owner, repository.repo),
    });
});

router.post('/comparison/commits', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() - 59);

    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    if (repository === null) {
        return res.status(404).json({});
    }

    const [results, meta] = await connection.query(`
        WITH RECURSIVE dates(date) AS (VALUES (:since) UNION ALL SELECT DATE (DATE, '+1 day')
        FROM dates
        WHERE DATE < DATE ('now'))

        SELECT 'human'           AS userType,
               dates.date        AS committedOn,
               COUNT(commits.id) AS commitCount
        FROM dates
                 LEFT JOIN commits ON DATE (commits.committedAt) = dates.date AND commits.repositoryId = :repositoryId AND commits.isBot = 0
        GROUP BY dates.date
        UNION ALL
        SELECT 'bot'             AS userType,
               dates.date        AS committedOn,
               COUNT(commits.id) AS commitCount
        FROM dates
                 LEFT JOIN commits ON DATE (commits.committedAt) = dates.date AND commits.repositoryId = :repositoryId AND commits.isBot = 1
        GROUP BY dates.date
        ORDER BY userType, committedOn
    `, {
        replacements: {
            repositoryId: repository.id,
            since: date.toISOString().substring(0, 10),
        },
    });

    return res.json({
        results: results,
        annotations: getAnnotations(repository.owner, repository.repo),
    });
});

router.post('/comparison/comments/:type', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() - 59);

    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    if (repository === null) {
        return res.status(404).json({});
    }

    const [results, meta] = await connection.query(`
        WITH RECURSIVE dates(date) AS (VALUES (:since) UNION ALL SELECT DATE (DATE, '+1 day')
        FROM dates
        WHERE DATE < DATE ('now'))

        SELECT 'human'            AS userType,
               dates.date         AS commentedOn,
               COUNT(comments.id) AS commentCount
        FROM dates
                 LEFT JOIN (comments LEFT JOIN issues ON comments.issueId = issues.id)
                           ON DATE (comments.commentedAt) = dates.date AND comments.repositoryId = :repositoryId AND comments.isBot = 0 AND issues.type = :issueType
        GROUP BY dates.date
        UNION ALL
        SELECT 'bot'              AS userType,
               dates.date         AS commentedOn,
               COUNT(comments.id) AS commentCount
        FROM dates
                 LEFT JOIN (comments LEFT JOIN issues ON comments.issueId = issues.id)
                           ON DATE (comments.commentedAt) = dates.date AND comments.repositoryId = :repositoryId AND comments.isBot = 1 AND issues.type = :issueType
        GROUP BY dates.date
        ORDER BY userType, commentedOn
    `, {
        replacements: {
            repositoryId: repository.id,
            since: date.toISOString().substring(0, 10),
            issueType: req.params.type === 'pull-requests' ? IssueType.PULL_REQUEST : IssueType.ISSUE,
        },
    });

    return res.json({
        results: results,
        annotations: getAnnotations(repository.owner, repository.repo),
    });
});

router.post('/interaction/:type', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() - 59);

    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    if (repository === null) {
        return res.status(404).json({});
    }

    const [results, meta] = await connection.query(`
        WITH RECURSIVE dates(date) AS (VALUES (:since) UNION ALL SELECT DATE (DATE, '+1 day')
        FROM dates
        WHERE DATE < DATE ('now'))

        SELECT dates.date                AS interactionOn,
               COUNT(DISTINCT issues.id) AS issueCount,
               COUNT(comments.id)        AS interactionCount
        FROM dates
                 LEFT JOIN issues ON DATE (issues.openedAt) = dates.date AND issues.repositoryId = :repositoryId AND issues.type = :issueType AND issues.openerIsBot = 0
            LEFT JOIN comments
        ON issues.id = comments.issueId AND comments.isBot = 1
        GROUP BY dates.date
        ORDER BY interactionOn
    `, {
        replacements: {
            repositoryId: repository.id,
            since: date.toISOString().substring(0, 10),
            issueType: req.params.type === 'pull-requests' ? IssueType.PULL_REQUEST : IssueType.ISSUE,
        },
    });

    return res.json({
        results: results,
        annotations: getAnnotations(repository.owner, repository.repo),
    });
});

router.post('/actions', async (req, res) => {
    const repository = await Repository.findOne({
        where: {
            owner: req.body.owner,
            repo: req.body.repo,
        },
    });

    if (repository === null) {
        return res.status(404).json({});
    }

    const [results, meta] = await connection.query(`
        WITH actions AS
                 (SELECT issues.id       as id,
                         issues.openedBy as botId,
                         issues.openedBy as botName,
                         'opened'        as type,
                         issues.id       as objectId,
                         issues.type     as objectType,
                         issues.number   as objectNumber,
                         issues.title    as objectTitle,
                         issues.url      as objectUrl,
                         issues.openedAt as happenedAt
                  FROM issues
                  WHERE issues.repositoryId = :repositoryId
                    AND issues.openerIsBot = 1
                  UNION ALL
                  SELECT issues.id       as id,
                         issues.closedBy as botId,
                         issues.closedBy as botName,
                         'closed'        as type,
                         issues.id       as objectId,
                         issues.type     as objectType,
                         issues.number   as objectNumber,
                         issues.title    as objectTitle,
                         issues.url      as objectUrl,
                         issues.closedAt as happenedAt
                  FROM issues
                  WHERE issues.repositoryId = :repositoryId
                    AND issues.closerIsBot = 1
                  UNION ALL
                  SELECT issues.id       as id,
                         issues.closedBy as botId,
                         issues.closedBy as botName,
                         'merged'        as type,
                         issues.id       as objectId,
                         issues.type     as objectType,
                         issues.number   as objectNumber,
                         issues.title    as objectTitle,
                         issues.url      as objectUrl,
                         issues.mergedAt as happenedAt
                  FROM issues
                  WHERE issues.repositoryId = :repositoryId
                    AND issues.closerIsBot = 1
                  UNION ALL
                  SELECT commits.id          as id,
                         commits.user        as botId,
                         commits.user        as botName,
                         'committed'         as type,
                         commits.id          as objectId,
                         'code'              as objectType,
                         commits.hash        as objectNumber,
                         commits.message     as objectTitle,
                         commits.url         as objectUrl,
                         commits.committedAt as happenedAt
                  FROM commits
                  WHERE commits.repositoryId = :repositoryId
                    AND commits.isBot = 1
                  UNION ALL
                  SELECT comments.id          as id,
                         comments.user        as botId,
                         comments.user        as botName,
                         'commented'          as type,
                         issues.id            as objectId,
                         issues.type          as objectType,
                         issues.number        as objectNumber,
                         issues.title         as objectTitle,
                         comments.url         as objectUrl,
                         comments.commentedAt as happenedAt
                  FROM comments
                           INNER JOIN issues ON comments.issueId = issues.id
                  WHERE comments.repositoryId = :repositoryId
                    AND comments.isBot = 1)

        SELECT *
        FROM actions
        WHERE actions.happenedAt IS NOT NULL
        ORDER BY actions.happenedAt DESC LIMIT :take
        OFFSET :skip
    `, {
        replacements: {
            repositoryId: repository.id,
            skip: req.body.skip,
            take: Math.min(req.body.take, 50),
        },
    });

    return res.json({results});
});

export default router;
