// Transaction management functions

// Add a new transaction
function addTransaction(transactionData) {
    // Validate data
    if (!validateTransaction(transactionData)) {
        showNotification('Invalid transaction data', 'error');
        return false;
    }
    
    // Get existing transactions
    const transactions = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.TRANSACTIONS)) || [];
    
    // Create new transaction object with ID and timestamps
    const newTransaction = {
        ...transactionData,
        id: generateId('trans-'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add to array and save
    transactions.push(newTransaction);
    localStorage.setItem(APP_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    
    // Update UI
    renderTransactionsList();
    showNotification('Transaction added successfully', 'success');
    return true;
}

// Update existing transaction
function updateTransaction(transactionId, updatedData) {
    // Get existing transactions
    const transactions = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.TRANSACTIONS)) || [];
    
    // Find the transaction to update
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    
    if (transactionIndex === -1) {
        showNotification('Transaction not found', 'error');
        return false;
    }
    
    // Update transaction
    transactions[transactionIndex] = {
        ...transactions[transactionIndex],
        ...updatedData,
        updatedAt: new Date().toISOString()
    };
    
    // Save updated transactions
    localStorage.setItem(APP_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    
    // Update UI
    renderTransactionsList();
    showNotification('Transaction updated successfully', 'success');
    return true;
}

// Delete transaction
function deleteTransaction(transactionId) {
    // Get existing transactions
    const transactions = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.TRANSACTIONS)) || [];
    
    // Filter out the transaction to delete
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    
    if (updatedTransactions.length === transactions.length) {
        showNotification('Transaction not found', 'error');
        return false;
    }
    
    // Save updated transactions
    localStorage.setItem(APP_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
    
    // Update UI
    renderTransactionsList();
    showNotification('Transaction deleted successfully', 'success');
    return true;
}

// Get transactions with optional filters
function getTransactions(filters = {}) {
    const transactions = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.TRANSACTIONS)) || [];
    
    // Apply filters if provided
    return transactions.filter(transaction => {
        let matchesFilters = true;
        
        // Filter by type (income, expense, or all)
        if (filters.type && filters.type !== 'all') {
            matchesFilters = matchesFilters && transaction.type === filters.type;
        }
        
        // Filter by month (YYYY-MM format)
        if (filters.month) {
            const transactionDate = new Date(transaction.date);
            const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
            matchesFilters = matchesFilters && transactionMonth === filters.month;
        }
        
        // Filter by date range
        if (filters.startDate) {
            matchesFilters = matchesFilters && new Date(transaction.date) >= new Date(filters.startDate);
        }
        
        if (filters.endDate) {
            matchesFilters = matchesFilters && new Date(transaction.date) <= new Date(filters.endDate);
        }
        
        // Filter by category
        if (filters.category) {
            matchesFilters = matchesFilters && transaction.category === filters.category;
        }
        
        // Filter by search text
        if (filters.searchText) {
            const searchLower = filters.searchText.toLowerCase();
            matchesFilters = matchesFilters && (
                transaction.description.toLowerCase().includes(searchLower) ||
                transaction.category.toLowerCase().includes(searchLower)
            );
        }
        
        return matchesFilters;
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date (newest first)
}

// Validate transaction data
function validateTransaction(transaction) {
    // Check for required fields
    if (!transaction.type || !transaction.category || !transaction.date || !transaction.amount) {
        return false;
    }
    
    // Validate amount (must be a positive number)
    if (isNaN(transaction.amount) || transaction.amount <= 0) {
        return false;
    }
    
    // Validate type (must be 'income' or 'expense')
    if (transaction.type !== 'income' && transaction.type !== 'expense') {
        return false;
    }
    
    return true;
}

// Get transaction categories by type
function getCategoriesByType(type) {
    const categories = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.CATEGORIES)) || [];
    return categories.filter(category => category.type === type);
}

// Render transactions list
function renderTransactionsList() {
    const transactionsListElement = document.getElementById('transactions-list');
    if (!transactionsListElement) return;
    
    // Get filters if available
    const typeFilter = document.getElementById('filter-type');
    const monthFilter = document.getElementById('filter-month');
    
    const filters = {
        type: typeFilter ? typeFilter.value : 'all',
        month: monthFilter ? monthFilter.value : null
    };
    
    // Get filtered transactions
    const transactions = getTransactions(filters);
    
    // Get categories for displaying names
    const categories = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.CATEGORIES)) || [];
    
    // Ensure we have thead and tbody
    let tbody;
    if (!transactionsListElement.tHead) {
        // Create table structure if it doesn't exist (for compatibility)
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
        transactionsListElement.appendChild(thead);
        
        tbody = document.createElement('tbody');
        transactionsListElement.appendChild(tbody);
    } else {
        tbody = transactionsListElement.tBodies[0];
        tbody.innerHTML = '';
    }
    
    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-3">
                    <div class="alert alert-info mb-0">
                        No transactions found.
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Create transaction rows
    transactions.forEach(transaction => {
        const category = categories.find(c => c.id === transaction.category) || { name: 'Unknown' };
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description || '<span class="text-muted">No description</span>'}</td>
            <td>
                <span class="badge bg-secondary">${category.name}</span>
            </td>
            <td class="${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}">
                ${formatCurrency(transaction.amount)}
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${transaction.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${transaction.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Add to table
        tbody.appendChild(row);
    });
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', () => {
            const transactionId = button.getAttribute('data-id');
            // Open edit form with transaction data
            editTransaction(transactionId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', () => {
            const transactionId = button.getAttribute('data-id');
            // Show confirm dialog
            showDeleteConfirmation(transactionId);
        });
    });
}

// Show delete confirmation dialog
function showDeleteConfirmation(transactionId) {
    // Create modal elements
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal fade';
    modalBackdrop.id = 'deleteConfirmModal';
    modalBackdrop.tabIndex = '-1';
    modalBackdrop.setAttribute('aria-hidden', 'true');
    
    modalBackdrop.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title">Confirm Delete</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this transaction? This action cannot be undone.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalBackdrop);
    
    // Initialize Bootstrap modal
    const modal = new bootstrap.Modal(modalBackdrop);
    modal.show();
    
    // Add event listener to delete button
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        deleteTransaction(transactionId);
        modal.hide();
        // Remove modal from DOM after hidden
        modalBackdrop.addEventListener('hidden.bs.modal', () => {
            modalBackdrop.remove();
        });
    });
    
    // Remove modal from DOM when hidden
    modalBackdrop.addEventListener('hidden.bs.modal', () => {
        modalBackdrop.remove();
    });
}

// Edit transaction
function editTransaction(transactionId) {
    // Get transactions
    const transactions = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.TRANSACTIONS)) || [];
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) {
        showNotification('Transaction not found', 'error');
        return;
    }
    
    // Fill form with transaction data
    const typeSelect = document.getElementById('transaction-type');
    const categorySelect = document.getElementById('transaction-category');
    const amountInput = document.getElementById('transaction-amount');
    const dateInput = document.getElementById('transaction-date');
    const descriptionInput = document.getElementById('transaction-description');
    
    if (typeSelect) typeSelect.value = transaction.type;
    if (dateInput) dateInput.value = transaction.date;
    if (amountInput) amountInput.value = transaction.amount;
    if (descriptionInput) descriptionInput.value = transaction.description || '';
    
    // Update categories dropdown based on selected type
    if (typeSelect && categorySelect) {
        updateCategoryOptions();
        setTimeout(() => {
            // Need timeout because updateCategoryOptions replaces the select element
            const newCategorySelect = document.getElementById('transaction-category');
            if (newCategorySelect) {
                // Find and select the transaction category
                for (let i = 0; i < newCategorySelect.options.length; i++) {
                    if (newCategorySelect.options[i].value === transaction.category) {
                        newCategorySelect.selectedIndex = i;
                        break;
                    }
                }
            }
        }, 0);
    }
    
    // Change form to edit mode
    const form = document.getElementById('transaction-form');
    if (form) {
        form.dataset.mode = 'edit';
        form.dataset.transactionId = transactionId;
        
        // Update submit button text
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-save me-1"></i> Update Transaction';
            submitButton.classList.remove('btn-primary');
            submitButton.classList.add('btn-success');
        }
        
        // Add cancel button if it doesn't exist
        if (!document.getElementById('cancel-edit-btn')) {
            const cancelButton = document.createElement('button');
            cancelButton.type = 'button';
            cancelButton.id = 'cancel-edit-btn';
            cancelButton.className = 'btn btn-outline-secondary w-100 mt-2';
            cancelButton.innerHTML = '<i class="fas fa-times me-1"></i> Cancel';
            cancelButton.addEventListener('click', resetTransactionForm);
            
            submitButton.parentNode.appendChild(cancelButton);
        }
        
        // Add a status message
        const statusMessage = document.createElement('div');
        statusMessage.className = 'alert alert-info mt-3';
        statusMessage.innerHTML = '<i class="fas fa-info-circle me-1"></i> You are now editing an existing transaction.';
        
        // Check if status message already exists
        const existingStatus = form.querySelector('.alert');
        if (!existingStatus) {
            form.appendChild(statusMessage);
        }
    }
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Reset transaction form
function resetTransactionForm() {
    const form = document.getElementById('transaction-form');
    if (!form) return;
    
    // Reset form and remove edit mode
    form.reset();
    form.dataset.mode = 'add';
    delete form.dataset.transactionId;
    
    // Reset submit button
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.innerHTML = '<i class="fas fa-plus-circle me-1"></i> Add Transaction';
        submitButton.classList.remove('btn-success');
        submitButton.classList.add('btn-primary');
    }
    
    // Remove cancel button
    const cancelButton = document.getElementById('cancel-edit-btn');
    if (cancelButton) cancelButton.remove();
    
    // Remove status message
    const statusMessage = form.querySelector('.alert');
    if (statusMessage) statusMessage.remove();
    
    // Reset category select to match transaction type
    updateCategoryOptions();
}

// Update category options based on selected type
function updateCategoryOptions() {
    const typeSelect = document.getElementById('transaction-type');
    const categorySelect = document.getElementById('transaction-category');
    
    if (!typeSelect || !categorySelect) return;
    
    const selectedType = typeSelect.value;
    const categories = getCategoriesByType(selectedType);
    
    // Remove any existing event listeners to prevent duplicates
    const newCategorySelect = categorySelect.cloneNode(false);
    categorySelect.parentNode.replaceChild(newCategorySelect, categorySelect);
    
    // Clear all options
    newCategorySelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a category';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    newCategorySelect.appendChild(defaultOption);
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        newCategorySelect.appendChild(option);
    });
    
    // Add "Add New Category" option
    const newCategoryOption = document.createElement('option');
    newCategoryOption.value = 'add_new_category';
    newCategoryOption.textContent = '+ Add New Category';
    newCategorySelect.appendChild(newCategoryOption);
    
    // Add event listener to detect when "Add New Category" is selected
    newCategorySelect.addEventListener('change', function() {
        if (this.value === 'add_new_category') {
            // Show the modal
            showNewCategoryDialog(selectedType);
            // Reset select back to "Select a category" option
            this.selectedIndex = 0;
        }
    });
}

// Show dialog to add a new category
function showNewCategoryDialog(type) {
    // Create modal elements
    const modalId = 'categoryModal';
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal fade';
    modalBackdrop.id = modalId;
    modalBackdrop.tabIndex = '-1';
    modalBackdrop.setAttribute('aria-hidden', 'true');
    
    // Generate a random color for default
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    
    modalBackdrop.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">Add New ${type.charAt(0).toUpperCase() + type.slice(1)} Category</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="new-category-form">
                        <div class="mb-3">
                            <label for="category-name" class="form-label">Category Name</label>
                            <input type="text" class="form-control" id="category-name" placeholder="Enter category name" required>
                        </div>
                        <div class="mb-3">
                            <label for="category-color" class="form-label">Category Color</label>
                            <input type="color" class="form-control form-control-color w-100" id="category-color" value="${randomColor}" title="Choose category color">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="save-category-btn">Add Category</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalBackdrop);
    
    // Initialize Bootstrap modal
    const modal = new bootstrap.Modal(modalBackdrop);
    modal.show();
    
    // Add event listener to save button
    document.getElementById('save-category-btn').addEventListener('click', () => {
        const name = document.getElementById('category-name').value;
        const color = document.getElementById('category-color').value;
        
        if (!name) {
            // Show error
            const nameInput = document.getElementById('category-name');
            nameInput.classList.add('is-invalid');
            
            // Add error message if not exists
            if (!nameInput.nextElementSibling || !nameInput.nextElementSibling.classList.contains('invalid-feedback')) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'invalid-feedback';
                errorMsg.textContent = 'Please enter a category name';
                nameInput.parentNode.appendChild(errorMsg);
            }
            return;
        }
        
        // Create and save new category
        const success = addNewCategory(type, name, color);
        
        if (success) {
            // Close modal
            modal.hide();
            
            // Remove modal from DOM after hidden
            modalBackdrop.addEventListener('hidden.bs.modal', () => {
                modalBackdrop.remove();
            });
        }
    });
    
    // Reset category select when modal is dismissed
    modalBackdrop.addEventListener('hidden.bs.modal', () => {
        resetCategorySelect();
        modalBackdrop.remove();
    });
    
    // Add validation to name input
    const nameInput = document.getElementById('category-name');
    nameInput.addEventListener('input', () => {
        if (nameInput.value.trim()) {
            nameInput.classList.remove('is-invalid');
        } else {
            nameInput.classList.add('is-invalid');
        }
    });
}

// Reset category select back to placeholder
function resetCategorySelect() {
    const categorySelect = document.getElementById('transaction-category');
    if (categorySelect) {
        categorySelect.selectedIndex = 0;
    }
}

// Add a new category to the system
function addNewCategory(type, name, color) {
    if (!name) return false;
    
    // Get existing categories
    const categories = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.CATEGORIES)) || [];
    
    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase() && cat.type === type)) {
        showNotification('Category already exists', 'error');
        return false;
    }
    
    // Create new category
    const newCategory = {
        id: generateId(type + '-'),
        name: name,
        type: type,
        color: color || getRandomColor()
    };
    
    // Add to categories
    categories.push(newCategory);
    
    // Save to storage
    localStorage.setItem(APP_STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    
    // Refresh the category dropdown
    updateCategoryOptions();
    
    // Need to get the refreshed category select after updateCategoryOptions creates a new one
    setTimeout(() => {
        const categorySelect = document.getElementById('transaction-category');
        if (categorySelect) {
            // Find and select the new category
            for (let i = 0; i < categorySelect.options.length; i++) {
                if (categorySelect.options[i].value === newCategory.id) {
                    categorySelect.selectedIndex = i;
                    break;
                }
            }
        }
    }, 0);
    
    showNotification(`New ${type} category added: ${name}`, 'success');
    return true;
}

// Generate a random color for new categories
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Render recent transactions for dashboard
function renderRecentTransactions() {
    const recentTransactionsElement = document.getElementById('recent-transactions');
    if (!recentTransactionsElement) return;
    
    // Get 5 most recent transactions
    const transactions = getTransactions().slice(0, 5);
    
    // Get categories for displaying names
    const categories = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.CATEGORIES)) || [];
    
    if (transactions.length === 0) {
        recentTransactionsElement.innerHTML = '<p>No recent transactions.</p>';
        return;
    }
    
    // Create transaction list
    const transactionList = document.createElement('ul');
    transactionList.className = 'transaction-list';
    
    transactions.forEach(transaction => {
        const category = categories.find(c => c.id === transaction.category) || { name: 'Unknown' };
        
        const item = document.createElement('li');
        item.className = `transaction-item ${transaction.type}`;
        item.innerHTML = `
            <div class="transaction-date">${formatDate(transaction.date)}</div>
            <div class="transaction-details">
                <div class="transaction-description">${transaction.description || 'No description'}</div>
                <div class="transaction-category">${category.name}</div>
            </div>
            <div class="transaction-amount ${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}">
                ${formatCurrency(transaction.amount)}
            </div>
        `;
        
        transactionList.appendChild(item);
    });
    
    // Replace loading message with transaction list
    recentTransactionsElement.innerHTML = '';
    recentTransactionsElement.appendChild(transactionList);
} 