<template>
    <template v-if="isLoading && actions.length === 0">
        <div class="card bg-dark text-light mb-3">
            <div class="card-body">
                <div class="text-center text-secondary">
                    Loading timeline&hellip;
                </div>
            </div>
        </div>
    </template>
    <template v-else-if="actions.length === 0">
        <div class="card bg-dark text-light mb-3">
            <div class="card-body">
                <div class="text-center text-secondary">
                    No bot actions were found in this repository.
                </div>
            </div>
        </div>
    </template>
    <template v-else>
        <div class="card bg-dark text-light mb-3">
            <div class="card-body">
                <span>Show bot actions from</span>

                <template v-for="(bot, index) in bots">
                    <input type="checkbox" class="btn-check" :id="'bot-filter-' + index" :checked="! hiddenBots.includes(bot)" @change="toggleBot(bot)">
                    <label class="btn btn-outline-primary ms-3" :for="'bot-filter-' + index">{{ bot }}</label>
                </template>

                <hr>

                <span>Show bot actions about</span>

                <template v-for="(object, index) in objects">
                    <input type="checkbox" class="btn-check" :id="'object-filter-' + index" :checked="! hiddenObjects.includes(object.code)" @change="toggleObject(object.code)">
                    <label class="btn btn-outline-primary ms-3" :for="'object-filter-' + index">{{ object.description }}</label>
                </template>

                <hr>

                <span>Show bot actions doing</span>

                <template v-for="(action, index) in actions">
                    <input type="checkbox" class="btn-check" :id="'action-filter-' + index" :checked="! hiddenActions.includes(action.code)" @change="toggleAction(action.code)">
                    <label class="btn btn-outline-primary ms-3" :for="'action-filter-' + index">{{ action.description }}</label>
                </template>
            </div>
        </div>

        <div v-show="filteredItems.length === 0">
            <div class="card bg-dark text-light mb-3">
                <div class="card-body">
                    <div class="text-center text-secondary">
                        No bot actions were found for these filters.
                    </div>
                </div>
            </div>
        </div>
        <div v-show="filteredItems.length > 0">
            <section v-bind="$attrs">
                <h4 class="text-center text-light" v-show="filteredItemsToday.length > 0">Today</h4>

                <bot-timeline-item
                    v-for="item in filteredItemsToday"
                    :key="item.action.type + '-' + item.id"
                    :item="item"
                />

                <h4 class="text-center text-light" v-show="filteredItemsYesterday.length > 0">Yesterday</h4>

                <bot-timeline-item
                    v-for="item in filteredItemsYesterday"
                    :key="item.action.type + '-' + item.id"
                    :item="item"
                />

                <h4 class="text-center text-light" v-show="filteredItemsOlder.length > 0">Earlier</h4>

                <bot-timeline-item
                    v-for="item in filteredItemsOlder"
                    :key="item.action.type + '-' + item.id"
                    :item="item"
                />
            </section>

            <div class="text-center" v-if="canLoadItems">
                <button type="button" class="btn btn-link mb-5" @click="loadItems()" @disabled="isLoading">
                    Show older actions&hellip;
                </button>
            </div>
        </div>
    </template>
</template>

<script>
import BotTimelineItem from './BotTimelineItem.vue';
import TimelineItem from "../objects/TimelineItem.js";

export default {
    name: 'BotTimeline',
    components: {
        BotTimelineItem,
    },
    data() {
        return {
            isLoading: true,
            canLoadItems: true,

            actions: [
                {
                    code: 'opened',
                    description: 'opening',
                },
                {
                    code: 'merged',
                    description: 'merging',
                },
                {
                    code: 'closed',
                    description: 'closing',
                },
                {
                    code: 'committed',
                    description: 'committing',
                },
                {
                    code: 'commented',
                    description: 'commenting',
                },
            ],
            objects: [
                {
                    code: 'pull_request',
                    description: 'pull requests',
                },
                {
                    code: 'issue',
                    description: 'issues',
                },
                {
                    code: 'code',
                    description: 'codebase',
                },
            ],

            hiddenBots: [],
            hiddenActions: [],
            hiddenObjects: [],

            items: [],
        };
    },
    computed: {
        bots() {
            return [...new Set(this.items.map((item) => {
                return item.bot.name;
            }))];
        },
        filteredItems() {
            const $vm = this;

            return $vm.items.filter((item) => {
                return !$vm.hiddenBots.includes(item.bot.name) &&
                    !$vm.hiddenActions.includes(item.action.type) &&
                    !$vm.hiddenObjects.includes(item.action.object.type);
            });
        },
        filteredItemsToday() {
            return this.filteredItems.filter((item) => {
                return item.isToday();
            });
        },
        filteredItemsYesterday() {
            return this.filteredItems.filter((item) => {
                return item.isYesterday();
            });
        },
        filteredItemsOlder() {
            return this.filteredItems.filter((item) => {
                return !item.isToday() && !item.isYesterday();
            });
        },
    },
    methods: {
        toggleBot(bot) {
            if (this.hiddenBots.includes(bot)) {
                this.hiddenBots = this.hiddenBots.filter((hidden) => {
                    return bot !== hidden;
                });
            } else {
                this.hiddenBots.push(bot);
            }
        },
        toggleAction(action) {
            if (this.hiddenActions.includes(action)) {
                this.hiddenActions = this.hiddenActions.filter((hidden) => {
                    return action !== hidden;
                });
            } else {
                this.hiddenActions.push(action);
            }
        },
        toggleObject(object) {
            if (this.hiddenObjects.includes(object)) {
                this.hiddenObjects = this.hiddenObjects.filter((hidden) => {
                    return object !== hidden;
                });
            } else {
                this.hiddenObjects.push(object);
            }
        },
        loadItems(count = 50) {
            const $vm = this;

            $vm.isLoading = true;

            return axios.post('/api/actions', {
                owner: window.repository.owner,
                repo: window.repository.repo,
                skip: $vm.items.length,
                take: count,
            }).then((response) => {
                const newItems = response.data.results.map((item) => {
                    return new TimelineItem({
                        id: item.id,
                        bot: {
                            id: item.botId,
                            name: item.botName,
                        },
                        action: {
                            type: item.type,
                            object: {
                                id: item.objectId,
                                type: item.objectType,
                                number: item.objectNumber,
                                title: item.objectTitle,
                                url: item.objectUrl,
                            },
                            happenedAt: new Date(item.happenedAt),
                        },
                    });
                });

                if (newItems.length < count) {
                    $vm.canLoadItems = false;
                }

                this.items.push(...newItems);
            }).finally(() => {
                $vm.isLoading = false;
            });
        },
    },
    created() {
        this.loadItems(50);
    }
};
</script>

<style lang="scss" scoped>
h4 {
    display: grid;
    grid-template-columns: minmax(20px, 1fr) auto minmax(20px, 1fr);
    grid-gap: 20px;
    align-items: center;
    width: 100%;
    margin-bottom: 2rem;
    text-align: center;
}

h4:before,
h4:after {
    content: '';
    border-top: 1px solid;
    border-bottom: 1px solid;
    border-color: rgba(255, 255, 255, 0.25);
}
</style>
