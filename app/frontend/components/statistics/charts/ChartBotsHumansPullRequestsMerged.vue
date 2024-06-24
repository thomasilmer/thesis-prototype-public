<template>
    <graph-card icon="fa-code-merge" title="Pull requests merged" subtitle="past 60 days" :loading="loading">
        <canvas id="bots-humans-pull-requests-merged-chart" width="350" height="350"></canvas>
    </graph-card>
</template>

<script>
import GraphCard from '../GraphCard.vue';
import {Bootstrap} from '../../../helpers/colors.js';
import {splitData} from '../../../helpers/data.js';

export default {
    name: 'ChartBotsHumansPullRequestsMerged',
    components: {GraphCard},
    data() {
        return {
            loading: true,
        };
    },
    created() {
        const $vm = this;

        axios.post('/api/comparison/pull-requests-merged', {
            owner: window.repository.owner,
            repo: window.repository.repo,
        }).then((response) => {
            const annotations = response.data.annotations;

            const slices = splitData(response.data.results, 2);

            const days = slices[0].map((item) => {
                return new Date(item.mergedOn).toLocaleString(
                    'en',
                    {weekday: 'short', month: 'short', day: 'numeric'},
                );
            });

            new Chart('bots-humans-pull-requests-merged-chart', {
                type: 'bar',
                data: {
                    labels: days,
                    datasets: [
                        {
                            label: 'Opened by bots',
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                            borderColor: 'rgba(255, 255, 255, 1)',
                            data: slices[0].map((item) => item.issueCount),
                        },
                        {
                            label: 'Opened by humans',
                            backgroundColor: Bootstrap.colors.primary(),
                            borderColor: Bootstrap.colors.primary(),
                            data: slices[1].map((item) => item.issueCount),
                        },
                    ],
                },
                options: {
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,
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
