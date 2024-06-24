<template>
    <div class="row">
        <div :class="colClass">
            <statistic-card :current="activeBots.current" :previous="activeBots.previous" icon="fa-robot" :loading="loading">
                Total active bots
            </statistic-card>
        </div>
        <div :class="colClass">
            <statistic-card :current="botActions.current" :previous="botActions.previous" icon="fa-timeline" :loading="loading">
                <a :href="'/' + owner + '/' + repo + '/timeline'">Actions performed by bots</a>
            </statistic-card>
        </div>
        <div :class="colClass">
            <statistic-card :current="pullRequestsCount.current" :previous="pullRequestsCount.previous" icon="fa-code-pull-request" :loading="loading">
                Pull requests submitted by bots
            </statistic-card>
        </div>
        <div :class="colClass">
            <statistic-card v-if="pullRequestsPercentage.isValid" :current="pullRequestsPercentage.current" :previous="pullRequestsPercentage.previous" unit="%" icon="fa-code-merge" :loading="loading">
                pull requests by bots merged
            </statistic-card>
        </div>
    </div>
</template>

<script>
import StatisticCard from './statistics/StatisticCard.vue';

export default {
    name: 'BotSummary',
    components: {
        StatisticCard,
    },
    data() {
        return {
            loading: true,

            activeBots: {
                current: null,
                previous: null,
            },
            botActions: {
                current: null,
                previous: null,
            },
            pullRequestsCount: {
                current: null,
                previous: null,
            },
            pullRequestsPercentage: {
                current: null,
                previous: null,
                isValid: true,
            },
        };
    },
    computed: {
        owner() {
            return window.repository.owner;
        },
        repo() {
            return window.repository.repo;
        },
        colClass() {
            if (! this.pullRequestsPercentage.isValid) {
                return 'col-lg-4';
            }

            return 'col-md-6 col-xl-3'
        },
    },
    created() {
        const $vm = this;

        axios.post('/api/bot-summary', {
            owner: window.repository.owner,
            repo: window.repository.repo,
        }).then((response) => {
            const results = response.data.results;

            $vm.botActions.current = results.current_bot_action_count;
            $vm.botActions.previous = results.previous_bot_action_count;

            $vm.activeBots.current = results.current_active_bot_count;
            $vm.activeBots.previous = results.previous_active_bot_count;

            $vm.pullRequestsCount.current = results.current_pull_request_count;
            $vm.pullRequestsCount.previous = results.previous_pull_request_count;

            $vm.pullRequestsPercentage.current = results.current_pull_request_count === 0 ? 0 : Math.round(results.current_merged_pull_request_count / results.current_pull_request_count * 100);
            $vm.pullRequestsPercentage.previous = results.previous_pull_request_count === 0 ? 0 : Math.round(results.previous_merged_pull_request_count / results.previous_pull_request_count * 100);
            $vm.pullRequestsPercentage.isValid = results.current_pull_request_count > 0;

            $vm.loading = false;
        });
    },
};
</script>

<style lang="scss" scoped>

</style>
