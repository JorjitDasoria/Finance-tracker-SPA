// Transactions management functions

// Add a new transaction
function addTransaction(transactionData) {
    // Validate transaction data
    if (!transactionData.type || !transactionData.category || !transactionData.date) {
        showNotification('Please fill in all required fields.', 'error');
        return false;
    }
    
    if (isNaN(parseFloat(transactionData.amount)) || parseFloat(transactionData.amount) <= 0) {
        showNotification('Please enter a valid amount.', 'error');
        return false;
    }
    
    // Create transaction object
    const transaction = {
        id: generateUUID(),
        type: transactionData.type,
        category: transactionData.category,
        amount: parseFloat(transactionData.amount),
        date: transactionData.date,
        description: transactionData.description || '',
        createdAt: new Date().toISOString()
    };
    
    // Get current transactions
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Add new transaction
    transactions.push(transaction);
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Save to local storage
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Show success notification
    showNotification('Transaction added successfully.', 'success');
    
    // Refresh transactions list
    renderTransactionsList();
    
    return true;
}

// Update an existing transaction
function updateTransaction(transactionId, transactionData) {
    // Validate transaction data
    if (!transactionData.type || !transactionData.category || !transactionData.date) {
        showNotification('Please fill in all required fields.', 'error');
        return false;
    }
    
    if (isNaN(parseFloat(transactionData.amount)) || parseFloat(transactionData.amount) <= 0) {
        showNotification('Please enter a valid amount.', 'error');
        return false;
    }
    
    // Get current transactions
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Find transaction by ID
    const index = transactions.findIndex(t => t.id === transactionId);
    
    if (index === -1) {
        showNotification('Transaction not found.', 'error');
        return false;
    }
    
    // Update transaction
    transactions[index] = {
        ...transactions[index],
        type: transactionData.type,
        category: transactionData.category,
        amount: parseFloat(transactionData.amount),
        date: transactionData.date,
        description: transactionData.description || '',
        updatedAt: new Date().toISOString()
    };
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Save to local storage
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Show success notification
    showNotification('Transaction updated successfully.', 'success');
    
    // Refresh transactions list
    renderTransactionsList();
    
    return true;
}

// Delete a transaction
function deleteTransaction(transactionId) {
    // Show confirmation dialog
    showConfirmation('Are you sure you want to delete this transaction?', () => {
        // Get current transactions
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        
        // Filter out the transaction to delete
        const updatedTransactions = transactions.filter(t => t.id !== transactionId);
        
        // Save to local storage
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        
        // Show success notification
        showNotification('Transaction deleted successfully.', 'success');
        
        // Refresh transactions list
        renderTransactionsList();
    });
}

// Reset transaction form to add mode
function resetTransactionForm() {
    const form = document.getElementById('transaction-form');
    
    if (form) {
        // Reset form data attribute
        form.dataset.mode = 'add';
        form.dataset.transactionId = '';
        
        // Reset form fields
        form.reset();
        
        // Set date to today
        const dateInput = document.getElementById('transaction-date');
        if (dateInput) {
            dateInput.valueAsDate = new Date();
        }
        
        // Update button text
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Add Transaction';
        }
    }
}

// Set transaction form to edit mode with transaction data
function editTransaction(transactionId) {
    const form = document.getElementById('transaction-form');
    
    if (form) {
        // Get transaction data
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const transaction = transactions.find(t => t.id === transactionId);
        
        if (!transaction) {
            showNotification('Transaction not found.', 'error');
            return;
        }
        
        // Set form to edit mode
        form.dataset.mode = 'edit';
        form.dataset.transactionId = transactionId;
        
        // Set form values
        const typeSelect = document.getElementById('transaction-type');
        if (typeSelect) {
            typeSelect.value = transaction.type;
            // Trigger category options update
            updateCategoryOptions();
        }
        
        // Set category after options are updated
        setTimeout(() => {
            const categorySelect = document.getElementById('transaction-category');
            if (categorySelect) {
                categorySelect.value = transaction.category;
            }
        }, 100);
        
        const amountInput = document.getElementById('transaction-amount');
        if (amountInput) {
            amountInput.value = transaction.amount;
        }
        
        const dateInput = document.getElementById('transaction-date');
        if (dateInput) {
            dateInput.value = transaction.date;
        }
        
        const descriptionInput = document.getElementById('transaction-description');
        if (descriptionInput) {
            descriptionInput.value = transaction.description || '';
        }
        
        // Update button text
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Update Transaction';
        }
        
        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

// Render transactions list
function renderTransactionsList() {
    const container = document.getElementById('transactions-list');
    if (!container) return;
    
    // Get filter values
    const typeFilter = document.getElementById('filter-type')?.value || 'all';
    const monthFilter = document.getElementById('filter-month')?.value || '';
    
    // Prepare filters object
    const filters = {};
    
    if (typeFilter !== 'all') {
        filters.type = typeFilter;
    }
    
    if (monthFilter) {
        filters.month = monthFilter;
    }
    
    // Get filtered transactions
    const transactions = getTransactions(filters);
    
    // Check if there are transactions
    if (transactions.length === 0) {
        container.innerHTML = '<p class="no-data">No transactions found. Add your first transaction using the form.</p>';
        return;
    }
    
    // Create table
    const table = document.createElement('table');
    table.className = 'data-table';
    
    // Create header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Actions</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.className = transaction.type === 'income' ? 'income-row' : 'expense-row';
        
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description || transaction.category}</td>
            <td>${transaction.category}</td>
            <td class="${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}">
                ${formatCurrency(transaction.amount)}
            </td>
            <td>
                <button class="btn btn-small edit-btn" data-id="${transaction.id}">Edit</button>
                <button class="btn btn-small btn-danger delete-btn" data-id="${transaction.id}">Delete</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    
    // Clear container and add table
    container.innerHTML = '';
    container.appendChild(table);
    
    // Add event listeners to buttons
    const editButtons = container.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            editTransaction(button.dataset.id);
        });
    });
    
    const deleteButtons = container.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            deleteTransaction(button.dataset.id);
        });
    });
} 