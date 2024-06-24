export default class TimelineItem {
    constructor({ id, bot, action }) {
        this.id = id;
        this.bot = bot;
        this.action = action;
    }

    getActionDescription() {
        switch (this.action.type) {
            case 'opened':
            case 'merged':
            case 'closed':
                return this.action.type;
            case 'committed':
                return 'committed ';
            case 'commented':
                return 'commented on';
        }

        return 'unknown action';
    }

    getObjectDescription() {
        switch (this.action.object.type) {
            case 'pull_request':
                return ' pull request #' + this.action.object.number;
            case 'issue':
                return ' issue #' + this.action.object.number;
            case 'code':
                return this.action.object.number.substring(0, 7);
        }

        return 'unknown object';
    }

    getObjectTitle() {
        switch (this.action.object.type) {
            case 'code':
                return this.action.object.title.substring(0, 40) + (this.action.object.title.length > 40 ? '[...]' : '');
        }

        return this.action.object.title;
    }

    getObjectUrl() {
        return this.action.object.url;
    }

    getFormattedHappenedAt() {
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        }).format(this.action.happenedAt);
    }

    isToday() {
        const today = new Date();

        return this.action.happenedAt.getDate() === today.getDate() &&
            this.action.happenedAt.getMonth() === today.getMonth() &&
            this.action.happenedAt.getFullYear() === today.getFullYear();
    }

    isYesterday() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        return this.action.happenedAt.getDate() === yesterday.getDate() &&
            this.action.happenedAt.getMonth() === yesterday.getMonth() &&
            this.action.happenedAt.getFullYear() === yesterday.getFullYear();
    }
}
