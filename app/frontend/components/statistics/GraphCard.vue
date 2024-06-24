<template>
    <div class="graph bg-dark text-light">
        <h4>
            <i v-if="! loading" class="fa-solid fa-fw text-secondary" :class="icon"></i>
            <i v-else class="fa-solid fa-fw fa-spin fa-circle-notch text-secondary"></i>
            <span>
                {{ title }}
                <small v-if="subtitle !== null" class="text-secondary">{{ subtitle }}</small>
            </span>
        </h4>
        <div>
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'GraphCard',
    props: {
        icon: String,
        title: String,
        subtitle: String,
        loading: Boolean,
    },
};
</script>

<style lang="scss" scoped>
.graph {
    height: calc(100% - 2rem);
    padding: 1.25rem;
    box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.25);
    margin-bottom: 2rem;

    h4 {
        display: flex;
        align-items: center;

        i {
            margin-right: 20px;
        }

        span {
            display: inline-block;

            small {
                font-size: 0.6em;
            }
        }
    }
}
</style>
