document.addEventListener('DOMContentLoaded', function () {
    document
        .querySelector('.header__menu-button')
        .addEventListener('click', function (e) {
            e.currentTarget.classList.toggle('header__menu-button--active');
        });
});
