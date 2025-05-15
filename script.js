const transactionForm = document.getElementById('transaction-form');
const transactionTableBody = document.getElementById('transaction-table-body');
const totalIncome = document.getElementById('total-income');
const totalExpenses = document.getElementById('total-expenses');
const netIncome = document.getElementById('net-income');
const errorMessage = document.getElementById('error-message');
const modal = document.getElementById('expense-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.querySelector('.close-btn');

let incomeTotal = 0;
let expenseTotal = 0;
let editMode = false;
let editRow = null;

// Open Modal
openModalBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    transactionForm.reset();
    editMode = false;
    errorMessage.textContent = '';
});

// Close Modal
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close Modal on Outside Click
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const type = document.getElementById('type').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);

    if (!date || !description || !category || isNaN(amount) || amount <= 0) {
        errorMessage.textContent = 'Please fill out all fields with valid data.';
        return;
    }

    errorMessage.textContent = '';

    if (editMode) {
        // Update existing row
        editRow.cells[0].textContent = type;
        editRow.cells[1].textContent = date;
        editRow.cells[2].textContent = description;
        editRow.cells[3].textContent = category;
        editRow.cells[4].textContent = `₹${amount.toFixed(2)}`;

        // Adjust totals
        const oldAmount = parseFloat(editRow.dataset.amount);
        if (editRow.dataset.type === 'income') {
            incomeTotal -= oldAmount;
        } else {
            expenseTotal -= oldAmount;
        }

        if (type === 'income') {
            incomeTotal += amount;
        } else {
            expenseTotal += amount;
        }

        updateSummary();
        editMode = false;
        editRow = null;
    } else {
        // Add new row
        const row = document.createElement('tr');
        row.dataset.type = type;
        row.dataset.amount = amount;
        row.innerHTML = `
            <td>${type}</td>
            <td>${date}</td>
            <td>${description}</td>
            <td>${category}</td>
            <td>₹${amount.toFixed(2)}</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;

        transactionTableBody.appendChild(row);

        if (type === 'income') {
            incomeTotal += amount;
        } else {
            expenseTotal += amount;
        }

        updateSummary();

        // Add event listeners for Edit and Delete buttons
        row.querySelector('.edit-btn').addEventListener('click', () => editTransaction(row));
        row.querySelector('.delete-btn').addEventListener('click', () => deleteTransaction(row));
    }

    transactionForm.reset();
    modal.style.display = 'none';
});

function editTransaction(row) {
    editMode = true;
    editRow = row;

    document.getElementById('type').value = row.cells[0].textContent;
    document.getElementById('date').value = row.cells[1].textContent;
    document.getElementById('description').value = row.cells[2].textContent;
    document.getElementById('category').value = row.cells[3].textContent;
    document.getElementById('amount').value = parseFloat(row.cells[4].textContent.replace('₹', ''));

    modal.style.display = 'flex';
}

function deleteTransaction(row) {
    const amount = parseFloat(row.dataset.amount);
    const type = row.dataset.type;

    if (type === 'income') {
        incomeTotal -= amount;
    } else {
        expenseTotal -= amount;
    }

    row.remove();
    updateSummary();
}

function updateSummary() {
    totalIncome.textContent = `₹${incomeTotal.toFixed(2)}`;
    totalExpenses.textContent = `₹${expenseTotal.toFixed(2)}`;
    netIncome.textContent = `₹${(incomeTotal - expenseTotal).toFixed(2)}`;
}

document.getElementById('apply-filters').addEventListener('click', () => {
    const typeFilter = document.getElementById('filter-type').value;
    const categoryFilter = document.getElementById('filter-category').value;
    const startDate = document.getElementById('filter-date-start').value;
    const endDate = document.getElementById('filter-date-end').value;

    const rows = document.querySelectorAll('#transaction-table-body tr');
    rows.forEach(row => {
        const type = row.cells[0].textContent.toLowerCase();
        const category = row.cells[3].textContent.toLowerCase();
        const date = row.cells[1].textContent;

        let showRow = true;

        if (typeFilter !== 'all' && type !== typeFilter) {
            showRow = false;
        }

        if (categoryFilter !== 'all' && category !== categoryFilter) {
            showRow = false;
        }

        if (startDate && new Date(date) < new Date(startDate)) {
            showRow = false;
        }

        if (endDate && new Date(date) > new Date(endDate)) {
            showRow = false;
        }

        row.style.display = showRow ? '' : 'none';
    });
});

document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.querySelector('header').classList.toggle('dark-mode');
    document.querySelector('footer').classList.toggle('dark-mode');
});

const ctx = document.getElementById('expense-chart').getContext('2d');
const expenseChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Food', 'Transport', 'Entertainment', 'Salary', 'Other'],
        datasets: [{
            label: 'Expense Breakdown',
            data: [5000, 2000, 0, 0, 0], // Example data
            backgroundColor: ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'],
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    },
});
