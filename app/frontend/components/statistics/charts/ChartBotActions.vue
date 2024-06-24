<template>
    <graph-card icon="fa-timeline" title="Bot actions" subtitle="past 60 days" :loading="loading">
        <canvas v-show="hasBots" id="bot-actions-chart" width="350" height="350"></canvas>
        <div v-show="! hasBots" class="p-5 text-center text-secondary">
            <strong>No bots detected</strong>
        </div>
    </graph-card>
</template>

<script>
import GraphCard from '../GraphCard.vue';

export default {
    name: 'ChartBotActions',
    components: {GraphCard},
    data() {
        return {
            loading: true,
            bots: null,
        };
    },
    computed: {
        hasBots() {
            return this.bots === null || this.bots.length > 0;
        },
    },
    created() {
        const $vm = this;

        axios.post('/api/bot-actions', {
            owner: window.repository.owner,
            repo: window.repository.repo,
        }).then((response) => {
            const bots = [...new Set(response.data.results.map((result) => result.username))];

            $vm.bots = bots;

            const datasets = [
                {
                    label: 'Issues',
                    backgroundColor: '#003f5c',
                    borderColor: '#003f5c',
                    data: [],
                },
                {
                    label: 'Pull requests',
                    backgroundColor: '#7a5195',
                    borderColor: '#7a5195',
                    data: [],
                },
                {
                    label: 'Comments',
                    backgroundColor: '#ef5675',
                    borderColor: '#ef5675',
                    data: [],
                },
                {
                    label: 'Commits',
                    backgroundColor: '#ffa600',
                    borderColor: '#ffa600',
                    data: [],
                },
            ];

            for (let i = 0; i <= bots.length; i++) {
                const bot = bots[i];
                const botResults = response.data.results.filter((result) => result.username === bot);

                datasets[0].data.push(botResults.find((botResult) => botResult.type === 'issue')?.interactions ?? 0);
                datasets[1].data.push(botResults.find((botResult) => botResult.type === 'pull_request')?.interactions ?? 0);
                datasets[2].data.push(botResults.find((botResult) => botResult.type === 'comment')?.interactions ?? 0);
                datasets[3].data.push(botResults.find((botResult) => botResult.type === 'commit')?.interactions ?? 0);
            }

            new Chart('bot-actions-chart', {
                type: 'bar',
                data: {
                    labels: bots,
                    datasets: datasets,
                },
                options: {
                    scales: {
                        x: {
                            stacked: false,
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0,
                            },
                            stacked: true,
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
