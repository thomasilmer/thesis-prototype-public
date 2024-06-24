import './setup/charts.js';

import {createApp} from 'vue';
import InsightsNavBar from './components/InsightsNavBar.vue';
import InsightsFooter from './components/InsightsFooter.vue';
import SuggestionCard from './components/SuggestionCard.vue';
import BotSummary from './components/BotSummary.vue';
import ActiveBots from './components/statistics/lists/ActiveBots.vue';
import ChartActiveBots from './components/statistics/charts/ChartActiveBots.vue';
import ChartBotActions from './components/statistics/charts/ChartBotActions.vue';
import ChartIssues from './components/statistics/charts/ChartIssues.vue';
import ChartPullRequests from './components/statistics/charts/ChartPullRequests.vue';
import ChartIssuesClosed from './components/statistics/charts/ChartIssuesClosed.vue';
import ChartPullRequestsClosed from './components/statistics/charts/ChartPullRequestsClosed.vue';
import ChartBotsHumansIssueComments from './components/statistics/charts/ChartBotsHumansIssueComments.vue';
import ChartBotsHumansIssues from './components/statistics/charts/ChartBotsHumansIssues.vue';
import ChartBotsHumansPullRequestComments from './components/statistics/charts/ChartBotsHumansPullRequestComments.vue';
import ChartBotsHumansPullRequests from './components/statistics/charts/ChartBotsHumansPullRequests.vue';
import ChartBotsHumansPullRequestsMerged from './components/statistics/charts/ChartBotsHumansPullRequestsMerged.vue';
import ChartBotsHumansCommits from './components/statistics/charts/ChartBotsHumansCommits.vue';
import ChartIssueInteraction from './components/statistics/charts/ChartIssueInteraction.vue';
import ChartPullRequestInteraction from './components/statistics/charts/ChartPullRequestInteraction.vue';

const segments = window.location.pathname.split('/');
window.repository = {
    owner: segments[1],
    repo: segments[2],
};

createApp({
    components: {
        InsightsNavBar,
        InsightsFooter,
        SuggestionCard,
        BotSummary,
        ActiveBots,
        ChartActiveBots,
        ChartBotActions,
        ChartIssues,
        ChartPullRequests,
        ChartIssuesClosed,
        ChartPullRequestsClosed,
        ChartBotsHumansIssueComments,
        ChartBotsHumansIssues,
        ChartBotsHumansPullRequestComments,
        ChartBotsHumansPullRequests,
        ChartBotsHumansPullRequestsMerged,
        ChartBotsHumansCommits,
        ChartIssueInteraction,
        ChartPullRequestInteraction,
    },
    data() {
        return {
            owner: window.repository.owner,
            repo: window.repository.repo,
        };
    },
    computed: {
        isFakeRepository() {
            return this.owner === 'thomasilmer';
        },
    },
    mounted() {
        document.querySelector('#app').style.display = 'block';
        document.title = `${this.owner}/${this.repo} | Metrics`;
    },
}).mount('#app');
