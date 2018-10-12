window.addEventListener('load', () => {
    const filterInput = document.querySelector('#find_input');

    filterInput.onkeyup = (e) => {
        console.log('Filter Input: ' + filterInput.value);
        fin.desktop.InterApplicationBus.publish('filter-input', filterInput.value);
    };

    filterInput.addEventListener('keyup', (evt) => {
        if (evt.key === 'Enter') {
            fin.desktop.InterApplicationBus.publish('filter-input-enter', 'key pressed');
        }
    });

    const searchBtn = document.querySelector('#btn_find');

    searchBtn.addEventListener('click', () => {
        fin.desktop.InterApplicationBus.publish('filter-input-enter', 'clicked');
    });
});