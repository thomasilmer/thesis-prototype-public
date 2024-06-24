export const Bootstrap = {
    colors: {
        primary: (alpha = 1) => 'rgba(13, 110, 253, ' + alpha + ')',
        success: (alpha = 1) => 'rgba(25, 135, 84, ' + alpha + ')',
        warning: (alpha = 1) => 'rgba(255, 193, 7, ' + alpha + ')',
        danger: (alpha = 1) => 'rgba(220, 53, 69, ' + alpha + ')',
    },
};

export const GitHub = {
    colors: {
        issues: {
            open: (alpha = 1) => 'rgba(63, 185, 80, ' + alpha + ')',
            completed: (alpha = 1) => 'rgba(163, 113, 247, ' + alpha + ')',
            closed: (alpha = 1) => 'rgba(192, 68, 63, ' + alpha + ')',
        },
        pr: {
            open: (alpha = 1) => 'rgba(63, 185, 80, ' + alpha + ')',
            merged: (alpha = 1) => 'rgba(163, 113, 247, ' + alpha + ')',
            closed: (alpha = 1) => 'rgba(192, 68, 63, ' + alpha + ')',
        },
    },
};
