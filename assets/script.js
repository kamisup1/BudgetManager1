document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transaction-form');
    const transactionsBody = document.getElementById('transactions-body');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const balanceEl = document.getElementById('balance');
    const ctx = document.getElementById('transactions-chart').getContext('2d');
    const selectMonth = document.getElementById('select-month');
    const selectMonthButton = document.getElementById('select-month-button');
    const printReportButton = document.getElementById('print-report-button');

    let transactions = [];
    let totalIncome = 0;
    let totalExpense = 0;
    let chart;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const transactionMonth = document.getElementById('transaction-month').value;

        const transaction = { description, amount, category, month: transactionMonth };
        transactions.push(transaction);

        updateBudgetSummary(selectMonth.value);
        updateUI(selectMonth.value);
        updateChart(selectMonth.value);
        form.reset();
    });

    selectMonthButton.addEventListener('click', () => {
        const selectedMonth = selectMonth.value;
        updateUI(selectedMonth);
        updateBudgetSummary(selectedMonth);
        updateChart(selectedMonth);
    });

    printReportButton.addEventListener('click', () => {
        const printers = ['PIXMA TS5150', 'i-SENSYS LBP243dw'];

        const select = document.createElement('select');
        printers.forEach(printer => {
            const option = document.createElement('option');
            option.textContent = printer;
            select.appendChild(option);
        });

        Swal.fire({
            title: 'Wybierz drukarke',
            html: select.outerHTML,
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Anuluj',
            focusConfirm: false,
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#f44336',
            background: '#f0f9f4',
            preConfirm: () => {
                return select.value;
            }
        }).then(result => {
            if (result.isConfirmed) {
                const selectedPrinter = result.value;
                Swal.fire({
                    title: `Rozpoczeto drukowanie na ${selectedPrinter}.`,
                    icon: 'success',
                    confirmButtonColor: '#4CAF50',
                    background: '#f0f9f4' 
                });
            } else {
                Swal.fire({
                    title: 'Drukowanie anulowane.',
                    icon: 'info',
                    confirmButtonColor: '#4CAF50', 
                    background: '#f0f9f4'
                });
            }
        });
    });

    function updateUI(selectedMonth) {
        transactionsBody.innerHTML = '';
        transactions.forEach(transaction => {
            if (selectedMonth === 'all' || transaction.month === selectedMonth) {
                const newRow = transactionsBody.insertRow();

                const descriptionCell = newRow.insertCell(0);
                descriptionCell.textContent = transaction.description;

                const amountCell = newRow.insertCell(1);
                amountCell.textContent = transaction.amount.toFixed(2);

                const categoryCell = newRow.insertCell(2);
                categoryCell.textContent = transaction.category;

                const monthCell = newRow.insertCell(3);
                monthCell.textContent = transaction.month;
            }
        });
    }

    function updateBudgetSummary(selectedMonth) {
        const filteredTransactions = transactions.filter(transaction => transaction.month === selectedMonth);

        totalIncome = filteredTransactions
            .filter(transaction => transaction.category === 'income')
            .reduce((acc, transaction) => acc + transaction.amount, 0);

        totalExpense = filteredTransactions
            .filter(transaction => transaction.category === 'expense')
            .reduce((acc, transaction) => acc + transaction.amount, 0);

        const balance = totalIncome - totalExpense;

        totalIncomeEl.textContent = totalIncome.toFixed(2);
        totalExpenseEl.textContent = totalExpense.toFixed(2);
        balanceEl.textContent = balance.toFixed(2);
    }

    function updateChart(selectedMonth) {
        if (chart) {
            chart.destroy();
        }

        const filteredTransactions = transactions.filter(transaction => selectedMonth === 'all' || transaction.month === selectedMonth);
        const incomeData = filteredTransactions.filter(transaction => transaction.category === 'income').reduce((acc, transaction) => acc + transaction.amount, 0);
        const expenseData = filteredTransactions.filter(transaction => transaction.category === 'expense').reduce((acc, transaction) => acc + transaction.amount, 0);

        const canvas = document.getElementById('transactions-chart');
        canvas.width = 400;
        canvas.height = 400; 
        const ctx = canvas.getContext('2d');


        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Przychody', 'Wydatki'],
                datasets: [{
                    data: [incomeData, expenseData],
                    backgroundColor: ['#4caf50', '#f44336'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,

  
            }
        });
    }
});