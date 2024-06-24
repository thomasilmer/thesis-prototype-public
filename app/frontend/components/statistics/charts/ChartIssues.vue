<template>
    <graph-card icon="fa-bug" title="Issues submitted by bots" subtitle="past 60 days" :loading="loading">
        <canvas id="issues-chart" width="350" height="350"></canvas>
    </graph-card>
</template>

<script>
import GraphCard from '../GraphCard.vue';
import {GitHub} from '../../../helpers/colors.js';
import {splitData} from '../../../helpers/data.js';

export default {
    name: 'ChartIssues',
    components: {GraphCard},
    data() {
        return {
            loading: true,
        };
    },
    created() {
        const $vm = this;

        axios.post('/api/issues', {
            owner: window.repository.owner,
            repo: window.repository.repo,
        }).then((response) => {
            const annotations = response.data.annotations;

            const slices = splitData(response.data.results, 2);

            const days = slices[0].map((item) => {
                return new Date(item.transitionOn).toLocaleString(
                    'en',
                    {weekday: 'short', month: 'short', day: 'numeric'},
                );
            });

            new Chart('issues-chart', {
                type: 'line',
                data: {
                    labels: days,
                    datasets: [
                        {
                            label: 'Closed',
                            backgroundColor: GitHub.colors.issues.closed(1),
                            borderColor: GitHub.colors.issues.closed(1),
                            data: slices[0].map((item) => item.transitionCount),
                        },
                        {
                            label: 'Opened',
                            backgroundColor: GitHub.colors.issues.open(1),
                            borderColor: GitHub.colors.issues.open(1),
                            data: slices[1].map((item) => item.transitionCount),
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
