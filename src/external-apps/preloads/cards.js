window.addEventListener('load', () => {
    window.addEventListener('click', (evt) => {
        if (evt.target.href === 'http://www.devfrontend.com/firstdata/busy_make_once_off_payment.html') {
            evt.preventDefault();
            const makePaymentWin = new fin.desktop.Window({
                name: 'make-payment-window',
                url: 'http://www.devfrontend.com/firstdata/busy_make_once_off_payment.html',
                autoShow: true
            });
        }
    });
});