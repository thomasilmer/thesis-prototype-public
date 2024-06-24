<template>
    <graph-card icon="fa-robot" title="Total active bots" subtitle="past 12 weeks" :loading="loading">
        <canvas v-show="hasBots" id="active-bots-chart" width="350" height="350"></canvas>
        <div v-show="! hasBots" class="p-5 text-center text-secondary">
            <strong>No bots detected</strong>
        </div>
    </graph-card>
</template>

<script>
import GraphCard from '../GraphCard.vue';

export default {
    name: 'ChartActiveBots',
    components: {GraphCard},
    data() {
        return {
            loading: true,
            botCounts: null,
        };
    },
    computed: {
        hasBots() {
            return this.botCounts === null || this.botCounts.some((botCount) => botCount > 0);
        },
    },
    created() {
        const $vm = this;

        axios.post('/api/active-bots', {
            owner: window.repository.owner,
            repo: window.repository.repo,
        }).then((response) => {
            const weeks = response.data.results.map((item) => {
                return 'Week ' + item.week;
            });

            $vm.botCounts = response.data.results.map((item) => item.botCount);

            new Chart('active-bots-chart', {
                type: 'line',
                data: {
                    labels: weeks,
                    datasets: [
                        {
                            label: 'Active bots',
                            backgroundColor: 'rgb(255, 255, 255)',
                            borderColor: 'rgb(255, 255, 255)',
                            data: $vm.botCounts,
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
                },
            });

            $vm.loading = false;
        });
    },
};
</script>

<style lang="scss" scoped>

</style>
