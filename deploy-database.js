import { Bot, BotCategory, BotCategoryPivot } from './database/definitions/bots.js';
import { Comment } from './database/definitions/comments.js';
import { Commit } from './database/definitions/commits.js';
import { Issue } from './database/definitions/issues.js';
import { Repository, RepositoryPopulationJob } from './database/definitions/repositories.js';

await Bot.sync({ force: true });
await BotCategory.sync({ force: true });
await BotCategoryPivot.sync({ force: true });
await Repository.sync({ force: true });
await RepositoryPopulationJob.sync({ force: true });
await Issue.sync({ force: true });
await Comment.sync({ force: true });
await Commit.sync({ force: true });
