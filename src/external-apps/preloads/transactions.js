window.addEventListener('load', () => {
    const filterInput = document.querySelector('#find_input');
    const searchBtn = document.querySelector('#btn_find');

    fin.desktop.InterApplicationBus.subscribe('*', 'filter-input', msg => {
        filterInput.value = msg;
    });

    fin.desktop.InterApplicationBus.subscribe('*', 'filter-input-enter', () => {
        console.log('enter pressed in admin');
        searchBtn.click();
    });
});