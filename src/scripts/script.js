document.addEventListener('DOMContentLoaded', function () {
    document
        .querySelector('.header__menu-button')
        .addEventListener('click', function (e) {
            e.currentTarget.classList.toggle('header__menu-button--active');
        });

    new Animation({
        animations: [
            {
                animations: [
                    {
                        elements: document.querySelectorAll('.hero__title svg'),
                        properties: {
                            transform: 'translateY(0%)',
                            transitionProperty: 'transform',
                            transitionTimingFunction: 'ease-out',
                            transitionDuration: '500ms'
                        },
                        method: 'parallel'
                    },
                    {
                        element: document.querySelector('.about__bg-blur'),
                        properties: {
                            opacity: 0.05,
                            transitionProperty: 'opacity',
                            transitionTimingFunction: 'ease-out',
                            transitionDuration: '250ms'
                        }
                    },
                    {
                        animations: [
                            {
                                element: document.querySelector(
                                    '.hero__title span:nth-child(1)'
                                ),
                                properties: {
                                    transform: 'translateY(0%)',
                                    transitionDelay: '500ms',
                                    transitionProperty: 'transform',
                                    transitionTimingFunction: 'ease-out',
                                    transitionDuration: '500ms'
                                }
                            },
                            {
                                element: document.querySelector(
                                    '.hero__title span:nth-child(3)'
                                ),
                                properties: {
                                    transform: 'translateY(0%)',
                                    transitionDelay: '500ms',
                                    transitionProperty: 'transform',
                                    transitionTimingFunction: 'ease-out',
                                    transitionDuration: '500ms'
                                }
                            }
                        ],
                        method: 'parallel'
                    }
                ],
                method: 'serially'
            },
            {
                animations: [
                    {
                        elements: [
                            document.querySelector('.hero__title'),
                            document.querySelector('.header')
                        ],
                        properties: {
                            transform: 'translateY(0%)',
                            transitionDelay: '150ms',
                            transitionProperty: 'transform',
                            transitionTimingFunction: 'ease-out',
                            transitionDuration: '500ms'
                        },
                        method: 'parallel'
                    },
                    {
                        elements: [
                            document.querySelector('.hero__head-bottom'),
                            document.querySelector('.mockup')
                        ],
                        properties: {
                            transform: 'translateY(0%)',
                            opacity: 1,
                            transitionDelay: '150ms',
                            transitionProperty: 'transform opacity',
                            transitionTimingFunction: 'ease-out',
                            transitionDuration: '500ms'
                        },
                        method: 'parallel'
                    },
                    {
                        element: document.querySelector('.hero__bg'),
                        properties: {
                            opacity: 1,
                            transitionDelay: '150ms',
                            transitionProperty: 'opacity',
                            transitionTimingFunction: 'ease-out',
                            transitionDuration: '500ms'
                        }
                    },
                    {
                        element: document.querySelector('.about__bg-blur'),
                        properties: {
                            opacity: 0.3,
                            transitionProperty: 'opacity',
                            transitionTimingFunction: 'ease-out',
                            transitionDuration: '500ms'
                        }
                    }
                ],
                method: 'parallel'
            }
        ],
        method: 'serially'
    });

    new Cursor(document.querySelector('.cursor'));
});

class Animation {
    constructor(config) {
        this._showUp(config);
    }

    async _showUp(config) {
        if (config.animations) {
            if (config.method === 'parallel') {
                await Promise.all(
                    config.animations.map((animation) => {
                        return this._showUp(animation);
                    })
                );

                return;
            }

            for (const animation of config.animations) {
                await this._showUp(animation);
            }

            return;
        }

        if (config.elements) {
            await this._showUpElements(config);
            return;
        }

        await this._showUpElement(config);
    }

    async _showUpElements(config) {
        if (config.method === 'parallel') {
            await Promise.all(
                Array.from(config.elements).map((element) => {
                    return this._showUpElement({
                        element,
                        ...config
                    });
                })
            );

            return;
        }

        for (const element of config.elements) {
            await this._showUpElement({
                element,
                ...config
            });
        }
    }

    async _showUpElement(config) {
        const {
            element,
            properties: {
                transitionDelay = 0,
                transitionProperty,
                transitionTimingFunction,
                transitionDuration,
                ...animatedProperties
            }
        } = config;

        const transitionProperties = {
            transitionDelay,
            transitionProperty,
            transitionTimingFunction,
            transitionDuration
        };

        await new Promise((resolve) => {
            this._setProperties(element, transitionProperties);

            setTimeout(() => {
                this._setProperties(element, animatedProperties);
            });

            setTimeout(
                () => {
                    resolve();

                    setTimeout(() => {
                        this._clearProperties(element, transitionProperties);
                    });
                },
                Number.parseInt(transitionDuration) +
                    Number.parseInt(transitionDelay)
            );
        });
    }

    _setProperties(element, properties) {
        Object.entries(properties).forEach(([ property, value ]) => {
            element.style[property] = value;
        });
    }

    _clearProperties(element, properties) {
        const emptyProperties = Object.assign({}, properties);

        for (const key in emptyProperties) {
            emptyProperties[key] = '';
        }

        this._setProperties(element, emptyProperties);
    }
}

class Cursor {
    constructor(element) {
        this._cursor = element;
        window.addEventListener(
            'mousemove',
            this._setCursorPosition.bind(this)
        );

        Array.from(document.querySelectorAll('a, button')).forEach(
            (element) => {
                element.addEventListener(
                    'mouseenter',
                    this._toggleHoverClass.bind(this)
                );
                element.addEventListener(
                    'mouseleave',
                    this._toggleHoverClass.bind(this)
                );
            }
        );
    }

    _setCursorPosition(e) {
        const position = {
            x: e.clientX - this._cursor.offsetWidth / 2,
            y: e.clientY - this._cursor.offsetHeight / 2
        };

        setTimeout(() => {
            this._cursor.style.transform = `translate(${position.x}px, ${position.y}px)`;
        })
    }

    _toggleHoverClass() {
        setTimeout(() => {
            this._cursor.classList.toggle('cursor--hover');
        })
    }
}
