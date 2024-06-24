<template>
    <graph-card icon="fa-robot" title="Recently active bots" subtitle="past 60 days" :loading="loading">
        <ul v-show="hasBots">
            <li v-for="bot in bots">
                <hr>
                <span class="bot-name">{{ bot.username }}</span>
                <span class="bot-latest-activity">
                    last seen on <time>{{ bot.latestActivityAt }}</time>
                </span>
                <br>
                <span class="bot-interactions">{{ bot.interactions }} recent interactions</span>
            </li>
        </ul>
        <div v-show="! hasBots" class="p-5 text-center text-secondary">
            <strong>No bots detected</strong>
        </div>
    </graph-card>
</template>

<script>
import GraphCard from '../GraphCard.vue';

export default {
    name: 'ActiveBots',
    components: {GraphCard},
    data() {
        return {
            loading: true,
            bots: [],
        };
    },
    computed: {
        hasBots() {
            return this.bots.length > 0;
        },
    },
    created() {
        const $vm = this;

        axios.post('/api/bots', {
            owner: window.repository.owner,
            repo: window.repository.repo,
        }).then((response) => {
            $vm.bots = response.data.results.map((bot) => {
                bot.latestActivityAt = new Date(bot.latestActivityAt).toLocaleString(
                    'en',
                    {month: 'short', day: 'numeric', year: 'numeric'},
                );

                return bot;
            });

            $vm.loading = false;
        });
    },
};
</script>

<style lang="scss" scoped>
.bot-name {
    font-size: 0.875em;
}

.bot-latest-activity {
    float: right;
    font-size: 0.75em;
    font-style: italic;
}

.bot-interactions {
    font-size: 0.75em;
}

ul {
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;

    li {
        margin-bottom: 10px;
    }
}
</style>
