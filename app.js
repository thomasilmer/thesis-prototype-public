import * as dotenv from 'dotenv';
import express from 'express';
import apiRouter from './app/routers/api.js';
import webRouter from './app/routers/web.js';
import {
    Repository,
    RepositoryPopulationJob,
    RepositoryPopulationJobStatus
} from './database/definitions/repositories.js';
import {rollbackRepository} from "./app/services/github.js";

dotenv.config();

const jobs = await RepositoryPopulationJob.findAll({
    where: {
        status: RepositoryPopulationJobStatus.DOWNLOADING,
    },
})

jobs.forEach(async (job) => {
    let repository = await Repository.findOne({
        where: {
            id: job.repositoryId,
        },
    });

    await rollbackRepository(repository, repository.latestPopulationAt);
});

await RepositoryPopulationJob.update({
    status: RepositoryPopulationJobStatus.CANCELED,
}, {
    where: {
        status: RepositoryPopulationJobStatus.DOWNLOADING,
    },
});

const app = express();

app.use(express.static('public'));

app.use('/api', apiRouter);
app.use('/', webRouter);

app.listen(process.env.APP_PORT, () => {
    console.info(`Listening on localhost:${process.env.APP_PORT}...`);
});
