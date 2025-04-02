// Storage keys
const APP_STORAGE_KEYS = {
    TRANSACTIONS: 'finance_tracker_transactions',
    CATEGORIES: 'finance_tracker_categories',
    BUDGETS: 'finance_tracker_budgets',
    SAVINGS_GOALS: 'finance_tracker_savings_goals',
    SETTINGS: 'finance_tracker_settings',
    USER: 'finance_tracker_user'
};

// Format currency
function formatCurrency(amount, currencyCode = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

// Generate a unique ID
function generateId(prefix = '') {
    return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get current month range (start date and end date)
function getCurrentMonthRange() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0]
    };
}

// Create element with attributes and children
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Append children
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });
    
    return element;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = createElement('div', {
        className: `notification ${type}`
    }, [message]);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize the app data if it doesn't exist
function initializeAppData() {
    // Check if data exists
    if (!localStorage.getItem(APP_STORAGE_KEYS.TRANSACTIONS)) {
        // Create sample transactions
        const sampleTransactions = [
            {
                id: generateId('trans-'),
                type: 'income',
                category: 'salary',
                amount: 3000,
                date: '2023-01-15',
                description: 'Monthly salary',
                createdAt: new Date().toISOString()
            },
            {
                id: generateId('trans-'),
                type: 'expense',
                category: 'groceries',
                amount: 150,
                date: '2023-01-18',
                description: 'Weekly groceries',
                createdAt: new Date().toISOString()
            },
            {
                id: generateId('trans-'),
                type: 'expense',
                category: 'utilities',
                amount: 100,
                date: '2023-01-20',
                description: 'Electricity bill',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(APP_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(sampleTransactions));
    }
    
    if (!localStorage.getItem(APP_STORAGE_KEYS.CATEGORIES)) {
        // Create default categories
        const defaultCategories = [
            { id: 'salary', name: 'Salary', type: 'income', color: '#2ecc71' },
            { id: 'freelance', name: 'Freelance', type: 'income', color: '#3498db' },
            { id: 'investments', name: 'Investments', type: 'income', color: '#9b59b6' },
            { id: 'groceries', name: 'Groceries', type: 'expense', color: '#e74c3c' },
            { id: 'dining', name: 'Dining Out', type: 'expense', color: '#f39c12' },
            { id: 'utilities', name: 'Utilities', type: 'expense', color: '#1abc9c' },
            { id: 'rent', name: 'Rent', type: 'expense', color: '#e67e22' },
            { id: 'transportation', name: 'Transportation', type: 'expense', color: '#95a5a6' },
            { id: 'entertainment', name: 'Entertainment', type: 'expense', color: '#d35400' }
        ];
        localStorage.setItem(APP_STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
    }
    
    if (!localStorage.getItem(APP_STORAGE_KEYS.BUDGETS)) {
        // Create sample budget
        const currentMonth = new Date().toISOString().substr(0, 7);
        const sampleBudget = {
            month: currentMonth,
            categories: [
                { categoryId: 'groceries', budgetAmount: 500, alert: 80 },
                { categoryId: 'dining', budgetAmount: 300, alert: 80 },
                { categoryId: 'utilities', budgetAmount: 250, alert: 90 },
                { categoryId: 'transportation', budgetAmount: 200, alert: 80 },
                { categoryId: 'entertainment', budgetAmount: 150, alert: 75 }
            ]
        };
        localStorage.setItem(APP_STORAGE_KEYS.BUDGETS, JSON.stringify([sampleBudget]));
    }
    
    if (!localStorage.getItem(APP_STORAGE_KEYS.SAVINGS_GOALS)) {
        // Create sample savings goals
        const sampleGoals = [
            {
                id: generateId('goal-'),
                name: 'Emergency Fund',
                targetAmount: 10000,
                currentAmount: 2500,
                targetDate: '2023-12-31',
                createdAt: new Date().toISOString(),
                contributions: [
                    { date: '2023-01-01', amount: 1000, notes: 'Initial deposit' },
                    { date: '2023-01-15', amount: 1000, notes: 'Monthly contribution' },
                    { date: '2023-02-15', amount: 500, notes: 'Monthly contribution' }
                ]
            }
        ];
        localStorage.setItem(APP_STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(sampleGoals));
    }
    
    if (!localStorage.getItem(APP_STORAGE_KEYS.SETTINGS)) {
        // Create default settings
        const defaultSettings = {
            currency: 'USD',
            theme: 'light',
            dateFormat: 'MM/DD/YYYY'
        };
        localStorage.setItem(APP_STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    }
}

// Utility functions for the finance tracker app

// Format currency based on user settings
function formatCurrency(amount, currency = 'USD') {
    const settings = getSettings();
    currency = settings.currency || currency;
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Format date based on user settings
function formatDate(dateString) {
    const settings = getSettings();
    const format = settings.dateFormat || 'MM/DD/YYYY';
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    switch (format) {
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        case 'MM/DD/YYYY':
        default:
            return `${month}/${day}/${year}`;
    }
}

// Parse date string to ISO format (YYYY-MM-DD)
function parseDate(dateString, format = 'MM/DD/YYYY') {
    let day, month, year;
    
    switch (format) {
        case 'DD/MM/YYYY':
            [day, month, year] = dateString.split('/');
            break;
        case 'YYYY-MM-DD':
            [year, month, day] = dateString.split('-');
            break;
        case 'MM/DD/YYYY':
        default:
            [month, day, year] = dateString.split('/');
            break;
    }
    
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Generate UUID for unique IDs
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after duration
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

// Show confirmation dialog
function showConfirmation(message, onConfirm, onCancel) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Create header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const title = document.createElement('h3');
    title.textContent = 'Confirmation';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-modal';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        modal.remove();
        if (onCancel) onCancel();
    });
    
    modalHeader.appendChild(title);
    modalHeader.appendChild(closeButton);
    
    // Create body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalBody.textContent = message;
    
    // Create footer with buttons
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    modalFooter.style.display = 'flex';
    modalFooter.style.justifyContent = 'flex-end';
    modalFooter.style.marginTop = '20px';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = 'Cancel';
    cancelButton.style.marginRight = '10px';
    cancelButton.addEventListener('click', () => {
        modal.remove();
        if (onCancel) onCancel();
    });
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'btn btn-primary';
    confirmButton.textContent = 'Confirm';
    confirmButton.addEventListener('click', () => {
        modal.remove();
        if (onConfirm) onConfirm();
    });
    
    modalFooter.appendChild(cancelButton);
    modalFooter.appendChild(confirmButton);
    
    // Assemble modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    modal.appendChild(modalContent);
    
    // Add to DOM
    document.body.appendChild(modal);
}

// Initialize app data
function initializeAppData() {
    // Initialize transactions if not exists
    if (!localStorage.getItem('transactions')) {
        localStorage.setItem('transactions', JSON.stringify([]));
    }
    
    // Initialize categories if not exists
    if (!localStorage.getItem('categories')) {
        const defaultCategories = {
            income: ['Salary', 'Investments', 'Freelance', 'Gifts', 'Other'],
            expense: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities', 'Education', 'Travel', 'Other']
        };
        localStorage.setItem('categories', JSON.stringify(defaultCategories));
    }
    
    // Initialize budgets if not exists
    if (!localStorage.getItem('budgets')) {
        localStorage.setItem('budgets', JSON.stringify([]));
    }
    
    // Initialize savings goals if not exists
    if (!localStorage.getItem('savingsGoals')) {
        localStorage.setItem('savingsGoals', JSON.stringify([]));
    }
    
    // Initialize settings if not exists
    if (!localStorage.getItem('settings')) {
        const defaultSettings = {
            currency: 'USD',
            theme: 'light',
            dateFormat: 'MM/DD/YYYY'
        };
        localStorage.setItem('settings', JSON.stringify(defaultSettings));
    }
}

// Get transactions from local storage
function getTransactions(filters = {}) {
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Apply filters if provided
    if (filters.type) {
        transactions = transactions.filter(t => t.type === filters.type);
    }
    
    if (filters.category) {
        transactions = transactions.filter(t => t.category === filters.category);
    }
    
    if (filters.month) {
        transactions = transactions.filter(t => t.date.startsWith(filters.month));
    }
    
    if (filters.startDate) {
        transactions = transactions.filter(t => t.date >= filters.startDate);
    }
    
    if (filters.endDate) {
        transactions = transactions.filter(t => t.date <= filters.endDate);
    }
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return transactions;
}

// Get categories from local storage
function getCategories() {
    return JSON.parse(localStorage.getItem('categories')) || {
        income: [],
        expense: []
    };
}

// Add a new category
function addCategory(type, categoryName) {
    const categories = getCategories();
    
    if (!categories[type].includes(categoryName)) {
        categories[type].push(categoryName);
        localStorage.setItem('categories', JSON.stringify(categories));
        return true;
    }
    
    return false;
}

// Delete a category
function deleteCategory(type, categoryName) {
    const categories = getCategories();
    
    const index = categories[type].indexOf(categoryName);
    if (index !== -1) {
        categories[type].splice(index, 1);
        localStorage.setItem('categories', JSON.stringify(categories));
        return true;
    }
    
    return false;
}

// Update category options based on transaction type
function updateCategoryOptions() {
    const typeSelect = document.getElementById('transaction-type');
    const categorySelect = document.getElementById('transaction-category');
    
    if (!typeSelect || !categorySelect) return;
    
    const type = typeSelect.value;
    const categories = getCategories()[type] || [];
    
    // Clear current options
    categorySelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a category';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    categorySelect.appendChild(defaultOption);
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Calculate required monthly savings for a goal
function calculateRequiredMonthlySavings(targetAmount, currentAmount, targetDate) {
    const today = new Date();
    const target = new Date(targetDate);
    
    // Calculate months difference
    const monthsDiff = (target.getFullYear() - today.getFullYear()) * 12 + 
                       (target.getMonth() - today.getMonth());
    
    if (monthsDiff <= 0) {
        return targetAmount - currentAmount;
    }
    
    return (targetAmount - currentAmount) / monthsDiff;
}

// Calculate progress percentage for a target
function calculateProgressPercentage(current, target) {
    if (target <= 0) return 100;
    
    const percentage = (current / target) * 100;
    return Math.min(Math.max(0, percentage), 100); // Clamp between 0-100
}

// Get random color for charts and visualizations
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Predefined colors for categories (for consistency)
const categoryColors = {
    // Income categories
    'Salary': '#4CAF50',
    'Investments': '#8BC34A',
    'Freelance': '#CDDC39',
    'Gifts': '#FFEB3B',
    'Other Income': '#FFC107',
    
    // Expense categories
    'Food': '#F44336',
    'Housing': '#E91E63',
    'Transportation': '#9C27B0',
    'Entertainment': '#673AB7',
    'Healthcare': '#3F51B5',
    'Shopping': '#2196F3',
    'Utilities': '#03A9F4',
    'Education': '#00BCD4',
    'Travel': '#009688',
    'Other': '#FF9800'
};

// Get color for a category
function getCategoryColor(category) {
    return categoryColors[category] || getRandomColor();
}

// Create a progress bar element
function createProgressBar(percentage, label, color = '#4CAF50') {
    const container = document.createElement('div');
    container.className = 'progress-container';
    
    const labelElement = document.createElement('div');
    labelElement.className = 'progress-label';
    labelElement.textContent = label;
    
    const progressTrack = document.createElement('div');
    progressTrack.className = 'progress-track';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.width = `${percentage}%`;
    progressBar.style.backgroundColor = color;
    
    const percentageLabel = document.createElement('div');
    percentageLabel.className = 'progress-percentage';
    percentageLabel.textContent = `${Math.round(percentage)}%`;
    
    progressTrack.appendChild(progressBar);
    
    container.appendChild(labelElement);
    container.appendChild(progressTrack);
    container.appendChild(percentageLabel);
    
    return container;
}

// Render recent transactions for dashboard
function renderRecentTransactions() {
    const recentTransactionsContainer = document.getElementById('recent-transactions');
    if (!recentTransactionsContainer) return;
    
    // Get 5 most recent transactions
    const transactions = getTransactions().slice(0, 5);
    
    if (transactions.length === 0) {
        recentTransactionsContainer.innerHTML = '<p class="no-data">No recent transactions.</p>';
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
        `;
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    
    // Clear container and add table
    recentTransactionsContainer.innerHTML = '';
    recentTransactionsContainer.appendChild(table);
    
    // Add "View All" button
    const viewAllButton = document.createElement('button');
    viewAllButton.className = 'btn btn-outline';
    viewAllButton.textContent = 'View All Transactions';
    viewAllButton.addEventListener('click', () => {
        window.location.hash = '#/transactions';
    });
    
    recentTransactionsContainer.appendChild(viewAllButton);
}

// Render budget overview for dashboard
function renderBudgetOverview() {
    const budgetOverviewContainer = document.getElementById('budget-overview');
    if (!budgetOverviewContainer) return;
    
    // Get current month
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Get budgets and expenses
    const budgets = JSON.parse(localStorage.getItem('budgets')) || [];
    const transactions = getTransactions({ 
        type: 'expense', 
        month: currentMonth 
    });
    
    if (budgets.length === 0) {
        budgetOverviewContainer.innerHTML = '<p class="no-data">No budgets set. <a href="#/budget">Create a budget</a>.</p>';
        return;
    }
    
    // Group expenses by category
    const expensesByCategory = transactions.reduce((acc, transaction) => {
        if (!acc[transaction.category]) {
            acc[transaction.category] = 0;
        }
        acc[transaction.category] += parseFloat(transaction.amount);
        return acc;
    }, {});
    
    // Create progress bars for each budget
    budgetOverviewContainer.innerHTML = '<h3>Month-to-Date Budget Status</h3>';
    
    budgets.forEach(budget => {
        const spent = expensesByCategory[budget.category] || 0;
        const percentage = calculateProgressPercentage(spent, budget.amount);
        
        // Set color based on percentage of budget used
        let color = '#4CAF50'; // Green (< 70%)
        if (percentage >= 90) {
            color = '#F44336'; // Red (>= 90%)
        } else if (percentage >= 70) {
            color = '#FFC107'; // Yellow (>= 70%)
        }
        
        const label = `${budget.category}: ${formatCurrency(spent)} of ${formatCurrency(budget.amount)}`;
        const progressBar = createProgressBar(percentage, label, color);
        
        budgetOverviewContainer.appendChild(progressBar);
    });
    
    // Add "View Budget" button
    const viewBudgetButton = document.createElement('button');
    viewBudgetButton.className = 'btn btn-outline';
    viewBudgetButton.textContent = 'Manage Budgets';
    viewBudgetButton.addEventListener('click', () => {
        window.location.hash = '#/budget';
    });
    
    budgetOverviewContainer.appendChild(viewBudgetButton);
}

// Render savings goals overview for dashboard
function renderSavingsGoalsOverview() {
    const savingsOverviewContainer = document.getElementById('savings-overview');
    if (!savingsOverviewContainer) return;
    
    // Get savings goals
    const savingsGoals = JSON.parse(localStorage.getItem('savingsGoals')) || [];
    
    if (savingsGoals.length === 0) {
        savingsOverviewContainer.innerHTML = '<p class="no-data">No savings goals set. <a href="#/savings">Create a goal</a>.</p>';
        return;
    }
    
    // Create progress bars for each savings goal
    savingsOverviewContainer.innerHTML = '<h3>Savings Goals Progress</h3>';
    
    savingsGoals.forEach(goal => {
        const currentAmount = goal.currentAmount || 0;
        const percentage = calculateProgressPercentage(currentAmount, goal.targetAmount);
        
        const label = `${goal.name}: ${formatCurrency(currentAmount)} of ${formatCurrency(goal.targetAmount)}`;
        const progressBar = createProgressBar(percentage, label);
        
        savingsOverviewContainer.appendChild(progressBar);
    });
    
    // Add "View Savings" button
    const viewSavingsButton = document.createElement('button');
    viewSavingsButton.className = 'btn btn-outline';
    viewSavingsButton.textContent = 'Manage Savings Goals';
    viewSavingsButton.addEventListener('click', () => {
        window.location.hash = '#/savings';
    });
    
    savingsOverviewContainer.appendChild(viewSavingsButton);
}

// Load demo data from JSON file
function loadDemoData() {
    fetch('../data/demo-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load demo data');
            }
            return response.json();
        })
        .then(data => {
            // Store each data section in local storage
            Object.keys(data).forEach(key => {
                localStorage.setItem(key, JSON.stringify(data[key]));
            });
            showNotification('Demo data loaded successfully!', 'success');
            
            // Refresh all views
            if (typeof renderDashboardSummary === 'function') renderDashboardSummary();
            if (typeof renderTransactionsList === 'function') renderTransactionsList();
            if (typeof renderBudgetProgress === 'function') renderBudgetProgress();
            if (typeof renderSavingsGoals === 'function') renderSavingsGoals();
            
            // If we're on a page with a router, navigate to dashboard
            if (typeof appRouter === 'object' && appRouter.navigateTo) {
                appRouter.navigateTo('/dashboard');
            }
        })
        .catch(error => {
            console.error('Error loading demo data:', error);
            showNotification('Failed to load demo data. See console for details.', 'error');
        });
} 