<template>
    <div class="timeline-item bg-dark text-light">
        <div class="actions">
            <div class="action">
                <i :class="iconClass"></i>
                <strong class="bot-name">{{ item.bot.name }}</strong>
                {{ item.getActionDescription() }} {{ item.getObjectDescription() }}:
                <a :href="item.getObjectUrl()" :title="item.getObjectTitle()" target="_blank">
                    {{ item.getObjectTitle() }}
                </a>.
            </div>
        </div>
        <time class="text-secondary">{{ item.getFormattedHappenedAt() }}</time>
    </div>
</template>

<script>
import TimelineItem from '../objects/TimelineItem.js';

export default {
    name: 'BotTimelineItem',
    props: {
        item: TimelineItem,
    },
    computed: {
        iconClass() {
            let result = 'fa-solid fa-fw fa-lg'

            switch (this.item.action.type) {
                case 'opened':
                    result += ' text-github-pr-open';
                    break;
                case 'merged':
                    result += ' text-github-pr-merged';
                    break;
                case 'closed':
                    result += ' text-github-pr-closed';
                    break;
                case 'commented':
                    return result + ' fa-comments';
            }

            switch (this.item.action.object.type) {
                case 'pull_request':
                    result += this.item.action.type === 'merged' ? ' fa-code-merge' : ' fa-code-pull-request';
                    break;
                case 'issue':
                    result += ' fa-bug';
                    break;
                case 'code':
                    result += ' fa-code-commit';
                    break;
                default:
                    break;
            }

            return result;
        },
    },
};
</script>

<style lang="scss" scoped>
.timeline-item {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    border-radius: 6px;
    box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.25);
    margin-bottom: 2rem;

    .actions .action {
        &:not(:last-child) {
            margin-bottom: 0.5rem;
        }

        i {
            margin-right: 0.5rem;
        }

        .bot-name {
            font-size: 0.875em;
        }
    }

    time {
        margin-left: auto;
        white-space: nowrap;
    }
}
</style>
