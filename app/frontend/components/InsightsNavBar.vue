<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div class="container-fluid">
            <a class="navbar-brand" href="/">GitHub Bot Insights</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="nav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item ms-lg-4">
                        <a class="nav-link" :class="{ active: isItemActive('index') }" :href="'/' + owner + '/' + repo">
                            Metrics
                        </a>
                    </li>
                    <li class="nav-item ms-lg-4">
                        <a class="nav-link" :class="{ active: isItemActive('timeline') }" :href="'/' + owner + '/' + repo + '/timeline'">
                            Timeline
                        </a>
                    </li>
<!--                    <li class="nav-item ms-lg-4">-->
<!--                        <a class="nav-link" :class="{ active: isItemActive('tasks') }" href="/tasks">-->
<!--                            Tasks-->
<!--                        </a>-->
<!--                    </li>-->
<!--                    <li class="nav-item ms-lg-4">-->
<!--                        <a class="nav-link" :class="{ active: isItemActive('?') }" href="#">-->
<!--                            CI Task Assistance-->
<!--                            <span class="badge rounded-pill bg-primary">1</span>-->
<!--                        </a>-->
<!--                    </li>-->
<!--                    <li class="nav-item">-->
<!--                        <a class="nav-link" :class="{ active: isItemActive('?') }" href="#">-->
<!--                            Code Review Assistance-->
<!--                            <span class="badge rounded-pill bg-primary">1</span>-->
<!--                        </a>-->
<!--                    </li>-->
<!--                    <li class="nav-item">-->
<!--                        <a class="nav-link disabled" :class="{ active: isItemActive('?') }" href="#">-->
<!--                            Community Management-->
<!--                            <span class="badge rounded-pill bg-secondary">0</span>-->
<!--                        </a>-->
<!--                    </li>-->
<!--                    <li class="nav-item">-->
<!--                        <a class="nav-link" :class="{ active: isItemActive('?') }" href="#">-->
<!--                            Dependency & Security Check-->
<!--                            <span class="badge rounded-pill bg-primary">1</span>-->
<!--                        </a>-->
<!--                    </li>-->
<!--                    <li class="nav-item">-->
<!--                        <a class="nav-link" :class="{ active: isItemActive('?') }" href="#">-->
<!--                            Issue & PR Management-->
<!--                            <span class="badge rounded-pill bg-primary">2</span>-->
<!--                        </a>-->
<!--                    </li>-->
<!--                    <li class="nav-item">-->
<!--                        <a class="nav-link disabled" :class="{ active: isItemActive('?') }" href="#">-->
<!--                            Documentation-->
<!--                            <span class="badge rounded-pill bg-secondary">0</span>-->
<!--                        </a>-->
<!--                    </li>-->
                </ul>
            </div>
            <!--            <div class="d-flex">-->
            <!--                <a href="/login" class="btn btn-outline-secondary">Switch repository</a>-->
            <!--            </div>-->
        </div>
    </nav>
</template>

<script>
export default {
    name: 'InsightsNavBar',
    props: {
        currentItem: String,
    },
    data() {
        return {
            owner: null,
            repo: null,
        };
    },
    methods: {
        isItemActive(page) {
            return this.currentItem === page;
        },
    },
    created() {
        const $vm = this;

        axios.post('/api/repository', {
            owner: window.repository.owner,
            repo: window.repository.repo,
        }).then((response) => {
            $vm.owner = response.data.repository.owner;
            $vm.repo = response.data.repository.repo;
        });
    },
};
</script>

<style lang="scss" scoped>
nav {
    box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.25);

    #nav {
        a {
            color: #0d6efd;

            &:hover {
                color: #0a58ca;
            }

            &.active {
                font-weight: bold;
            }
        }
    }
}
</style>
