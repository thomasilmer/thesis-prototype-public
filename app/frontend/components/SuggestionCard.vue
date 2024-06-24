<template>
    <div class="suggestion bg-dark text-light" :class="'suggestion-' + this.type">
        <h4>
            <i class="fa-solid fa-fw" :class="this.icon"></i>
            {{ title }}
        </h4>
        <p>
            <slot></slot>
        </p>
        <div v-if="typeof hint !== 'undefined'" class="hint">
            <hr>
            <p>
                Suggestion: {{ hint }}
            </p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SuggestionCard',
    props: {
        type: String,
        icon: String,
        title: String,
        hint: String,
    },
    computed: {
        cardClass() {
            return 'suggestion suggestion-' + this.type + ' bg-dark text-light';
        },
    },
};
</script>

<style lang="scss" scoped>
.suggestion {
    display: flex;
    flex-direction: column;
    height: calc(100% - 2rem);
    padding: 1.5rem;
    border-top: 6px solid transparent;
    border-radius: 6px;
    box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.25);
    margin-bottom: 2rem;

    &.suggestion-danger {
        border-color: #DC3545;

        i {
            color: #DC3545;
        }
    }

    &.suggestion-info {
        border-color: #17a2b8;

        i {
            color: #17a2b8;
        }
    }

    &.suggestion-primary {
        border-color: #007bff;

        i {
            color: #007bff;
        }
    }

    &.suggestion-success {
        border-color: #198754;

        i {
            color: #198754;
        }
    }

    &.suggestion-warning {
        border-color: #ffc107;

        i {
            color: #ffc107;
        }
    }

    i {
        margin-right: 0.5rem;
    }

    h4 {
        font-size: 1.25rem;
    }

    p {
        margin-bottom: 0;
        font-size: 0.875rem;
    }

    .hint {
        margin-top: auto;

        p {
            font-size: 0.75rem;
        }
    }
}
</style>
