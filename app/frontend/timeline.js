import {createApp} from 'vue';
import InsightsNavBar from './components/InsightsNavBar.vue';
import InsightsFooter from './components/InsightsFooter.vue';
import BotTimeline from './components/BotTimeline.vue';

const segments = window.location.pathname.split('/');
window.repository = {
    owner: segments[1],
    repo: segments[2],
};

createApp({
    components: {
        InsightsNavBar,
        InsightsFooter,
        BotTimeline,
    },
    data() {
        return {
            owner: window.repository.owner,
            repo: window.repository.repo,
        };
    },
    mounted() {
        document.title = `${this.owner}/${this.repo} | Timeline`;
    },
}).mount('#app');
