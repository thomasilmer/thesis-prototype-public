import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {RepositoryPopulationJob, RepositoryPopulationJobStatus} from '../../database/definitions/repositories.js';
import { getRepository, repopulateRepository } from '../services/github.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname, '../frontend/views/login.html'));
});

router.post('/', (req, res) => {
    const owner = req.body.owner;
    const repo = req.body.repo;

    return res.redirect('/' + owner + '/' + repo);
});

router.use('/:owner/:repo', async (req, res, next) => {
    let repository;

    try {
        repository = await getRepository(req.params.owner, req.params.repo);
    } catch (error) {
        if (error.status === 403 || error.status === 429) {
            console.error(`Rate limited reached while fetching ${req.params.owner}/${req.params.repo}.`);

            return res.status(429).sendFile(path.join(__dirname, '../frontend/views/429.html'));
        }

        if (error.status === 404) {
            return res.status(404).sendFile(path.join(__dirname, '../frontend/views/404.html'));
        }

        console.error(`Fatal exception while fetching ${req.params.owner}/${req.params.repo}.`);
        console.error(error);

        return res.status(500).sendFile(path.join(__dirname, '../frontend/views/500.html'));
    }

    const latestJob = await RepositoryPopulationJob.findOne({
        where: {
            repositoryId: repository.id,
        },
        order: [
            ['startedAt', 'DESC'],
        ],
    });

    if (latestJob === null || (latestJob.status !== RepositoryPopulationJobStatus.DOWNLOADING && (Date.now() - repository.latestPopulationAt) > 1000 * 60 * 60 * 24)) {
        repopulateRepository(repository).then();

        return res.sendFile(path.join(__dirname, '../frontend/views/populating.html'));
    } else if (latestJob.status === RepositoryPopulationJobStatus.DOWNLOADING) {
        return res.sendFile(path.join(__dirname, '../frontend/views/populating.html'));
    }

    next();
});

router.get('/:owner/:repo', (req, res) => {
    return res.sendFile(path.join(__dirname, '../frontend/views/index.html'));
});

router.get('/:owner/:repo/timeline', (req, res) => {
    return res.sendFile(path.join(__dirname, '../frontend/views/timeline.html'));
});

export default router;
