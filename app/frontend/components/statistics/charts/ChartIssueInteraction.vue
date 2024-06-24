<template>
    <graph-card icon="fa-arrow-right-arrow-left" title="Bot comments in human issues" subtitle="past 60 days" :loading="loading">
        <canvas id="issue-interaction-chart" width="350" height="350"></canvas>
    </graph-card>
</template>

<script>
import GraphCard from '../GraphCard.vue';
import {Bootstrap} from "../../../helpers/colors.js";

export default {
    name: 'ChartIssueInteraction',
    components: {GraphCard},
    data() {
        return {
            loading: true,
        };
    },
    created() {
        const $vm = this;

        axios.post('/api/interaction/issues', {
            owner: window.repository.owner,
            repo: window.repository.repo,
        }).then((response) => {
            const annotations = response.data.annotations;

            const days = response.data.results.map((item) => {
                return new Date(item.interactionOn).toLocaleString(
                    'en',
                    {weekday: 'short', month: 'short', day: 'numeric'},
                );
            });

            new Chart('issue-interaction-chart', {
                type: 'line',
                data: {
                    labels: days,
                    datasets: [
                        {
                            label: 'New issues by humans',
                            backgroundColor: Bootstrap.colors.primary(),
                            borderColor: Bootstrap.colors.primary(),
                            data: response.data.results.map((item) => item.issueCount),
                        },
                        {
                            label: '# of bot comments in issues opened that day',
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                            borderColor: 'rgba(255, 255, 255, 1)',
                            data: response.data.results.map((item) => item.interactionCount),
                        },
                    ],
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0,
                            },
                        },
                    },
                    plugins: {
                        annotation: {
                            annotations: annotations,
                        },
                    },
                },
            });

            $vm.loading = false;
        });
    },
};
</script>

<style lang="scss" scoped>

</style>
