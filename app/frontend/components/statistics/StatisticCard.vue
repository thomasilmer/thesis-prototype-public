<template>
    <div class="statistic bg-dark text-light">
        <div>
            <strong>
                {{ currentText }} <i v-if="trend !== null" :class="trendClass"></i>
                <small v-if="current !== previous" class="text-secondary">{{ Math.abs(current - previous) }}</small>
            </strong>
            <span>
                <slot></slot>
                <br>
                <small class="text-secondary">compared to {{ previousText }} in the 14 days prior</small>
            </span>
        </div>
        <div class="icon">
            <i v-if="! loading" class="fa-solid fa-fw text-secondary" :class="icon"></i>
            <i v-else class="fa-solid fa-fw fa-spin fa-circle-notch text-secondary"></i>
        </div>
    </div>
</template>

<script>
export default {
    name: 'StatisticCard',
    props: {
        valid: Boolean,
        current: Number,
        previous: Number,
        icon: String,
        loading: Boolean,
        unit: String,
    },
    computed: {
        currentText() {
            if (this.current === null) {
                return '-';
            }

            if (typeof this.unit === 'undefined') {
                return this.current;
            }

            return this.current + this.unit;
        },
        previousText() {
            if (this.previous === null) {
                return '-';
            }

            if (typeof this.unit === 'undefined') {
                return this.previous;
            }

            return this.previous + this.unit;
        },
        trend() {
            if (this.previous === null || this.current === null) {
                return null;
            }

            if (this.previous > this.current) {
                return 'down';
            }

            if (this.current > this.previous) {
                return 'up';
            }

            return 'equal';
        },
        trendClass() {
            if (this.trend === 'up') {
                return 'fa-solid fa-caret-up text-success';
            }

            if (this.trend === 'equal') {
                return 'fa-solid fa-minus text-warning';
            }

            if (this.trend === 'down') {
                return 'fa-solid fa-caret-down text-danger';
            }

            return '';
        },
    },
};
</script>

<style lang="scss" scoped>
.statistic {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.25);
    margin-bottom: 2rem;

    strong {
        display: block;
        font-family: monospace;
        font-size: 36px;
        line-height: 36px;

        small {
            margin-left: 10px;
            font-size: 12px;
            vertical-align: top;
        }
    }

    span {
        small {
            font-size: 12px;
        }
    }

    div.icon i {
        font-size: 36px;
    }
}
</style>
