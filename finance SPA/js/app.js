// Initialize application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize app data
    initializeAppData();
    
    // Apply settings immediately
    const settings = getSettings();
    applySettings(settings);
    console.log('Initial settings applied:', settings);
    
    // Define routes and controllers
    appRouter = new Router([
        { 
            path: '/dashboard', 
            template: dashboardTemplate, 
            controller: initDashboard 
        },
        { 
            path: '/transactions', 
            template: transactionsTemplate, 
            controller: initTransactions 
        },
        { 
            path: '/budget', 
            template: budgetTemplate, 
            controller: initBudget 
        },
        { 
            path: '/savings', 
            template: savingsTemplate, 
            controller: initSavings 
        },
        { 
            path: '/reports', 
            template: reportsTemplate, 
            controller: initReports 
        },
        { 
            path: '/settings', 
            template: settingsTemplate, 
            controller: initSettings 
        }
    ]);
    
    // Add CSS for notification system
    const notificationCSS = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            animation: fadeIn 0.3s ease-out;
        }
        
        .notification.info {
            background-color: var(--primary-color);
        }
        
        .notification.success {
            background-color: var(--secondary-color);
        }
        
        .notification.error {
            background-color: var(--danger-color);
        }
        
        .notification.fade-out {
            animation: fadeOut 0.3s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
        
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--light-gray);
        }
        
        .modal-header h3 {
            margin: 0;
        }
        
        .close-modal {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--dark-gray);
            padding: 0;
        }
        
        .chart-legend {
            display: flex;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            margin-right: 15px;
            margin-bottom: 10px;
        }
        
        .legend-color {
            display: inline-block;
            width: 12px;
            height: 12px;
            margin-right: 5px;
        }
        
        .category-color {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 5px;
        }
    `;
    
    // Add the CSS to the document
    const styleElement = document.createElement('style');
    styleElement.textContent = notificationCSS;
    document.head.appendChild(styleElement);
});

// Dashboard initialization
function initDashboard() {
    // Update dashboard summary
    renderDashboardSummary();
    
    // Load recent transactions
    renderRecentTransactions();
    
    // Load budget overview
    renderBudgetOverview();
    
    // Load savings goals overview
    renderSavingsGoalsOverview();
}

// Transactions initialization
function initTransactions() {
    // Set default date to today
    const dateInput = document.getElementById('transaction-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    
    // Set default month filter to current month
    const monthFilter = document.getElementById('filter-month');
    if (monthFilter) {
        const currentDate = new Date();
        const currentMonth = currentDate.toISOString().substr(0, 7);
        monthFilter.value = currentMonth;
    }
    
    // Initialize category options based on transaction type
    updateCategoryOptions();
    
    // Add event listeners
    const typeSelect = document.getElementById('transaction-type');
    if (typeSelect) {
        typeSelect.addEventListener('change', updateCategoryOptions);
    }
    
    // Initialize transaction form
    initTransactionForm();
    
    // Add filter event listeners
    const typeFilter = document.getElementById('filter-type');
    if (typeFilter) {
        typeFilter.addEventListener('change', renderTransactionsList);
    }
    
    if (monthFilter) {
        monthFilter.addEventListener('change', renderTransactionsList);
    }
    
    // Render transaction list
    renderTransactionsList();
}

// Budget initialization
function initBudget() {
    // Render budget settings form
    renderBudgetSettings();
    
    // Render budget progress
    renderBudgetProgress();
}

// Savings goals initialization
function initSavings() {
    // Set default target date to 1 year from now
    const targetDateInput = document.getElementById('goal-target-date');
    if (targetDateInput) {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        targetDateInput.valueAsDate = oneYearFromNow;
    }
    
    // Add form event listener
    const savingsGoalForm = document.getElementById('savings-goal-form');
    if (savingsGoalForm) {
        savingsGoalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const goalData = {
                name: document.getElementById('goal-name').value,
                targetAmount: document.getElementById('goal-target-amount').value,
                targetDate: document.getElementById('goal-target-date').value,
                initialAmount: document.getElementById('goal-initial-amount').value || 0
            };
            
            if (createSavingsGoal(goalData)) {
                // Reset form on success
                this.reset();
                
                // Set target date back to 1 year from now
                const oneYearFromNow = new Date();
                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                document.getElementById('goal-target-date').valueAsDate = oneYearFromNow;
            }
        });
    }
    
    // Render savings goals
    renderSavingsGoals();
}

// Reports initialization
function initReports() {
    // Set default date range (current year)
    const startDateInput = document.getElementById('report-start-date');
    const endDateInput = document.getElementById('report-end-date');
    
    if (startDateInput && endDateInput) {
        const currentDate = new Date();
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        
        startDateInput.valueAsDate = startOfYear;
        endDateInput.valueAsDate = currentDate;
    }
    
    // Add event listener to generate button
    const generateButton = document.getElementById('generate-report-btn');
    if (generateButton) {
        generateButton.addEventListener('click', generateReport);
    }
}

// Settings initialization
function initSettings() {
    // Initialize settings form
    initSettingsForm();
}

// Render dashboard summary
function renderDashboardSummary() {
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Get current month's transactions
    const transactions = getTransactions({ month: currentMonth });
    
    // Calculate totals
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
    const balance = income - expenses;
    
    // Update UI
    const incomeElement = document.getElementById('income-value');
    const expensesElement = document.getElementById('expenses-value');
    const balanceElement = document.getElementById('balance-value');
    const balanceCard = document.getElementById('balance-card');
    
    if (incomeElement) incomeElement.textContent = formatCurrency(income);
    if (expensesElement) expensesElement.textContent = formatCurrency(expenses);
    if (balanceElement) balanceElement.textContent = formatCurrency(balance);
    
    // Update balance card color based on value
    if (balanceCard) {
        balanceCard.className = balance >= 0 ? 'summary-card positive-balance' : 'summary-card negative-balance';
    }
}

// Initialize transaction form
function initTransactionForm() {
    const form = document.getElementById('transaction-form');
    if (!form) return;
    
    // Set default date to today
    const dateInput = document.getElementById('transaction-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    
    // Add event listener to type select for updating categories
    const typeSelect = document.getElementById('transaction-type');
    if (typeSelect) {
        typeSelect.addEventListener('change', updateCategoryOptions);
        
        // Initialize categories dropdown
        if (typeSelect.value) {
            updateCategoryOptions();
        }
    }
    
    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const transactionData = {
            type: document.getElementById('transaction-type').value,
            category: document.getElementById('transaction-category').value,
            amount: parseFloat(document.getElementById('transaction-amount').value),
            date: document.getElementById('transaction-date').value,
            description: document.getElementById('transaction-description').value || ''
        };
        
        // Validate data
        if (!transactionData.type || !transactionData.category || !transactionData.date || isNaN(transactionData.amount) || transactionData.amount <= 0) {
            // Show error notification
            showNotification('Please fill in all required fields with valid data.', 'error');
            
            // Highlight invalid fields with Bootstrap validation
            form.classList.add('was-validated');
            return;
        }
        
        let success = false;
        
        // Check if in edit mode
        if (form.dataset.mode === 'edit' && form.dataset.transactionId) {
            // Update existing transaction
            success = updateTransaction(form.dataset.transactionId, transactionData);
            
            if (success) {
                // Show success notification with Bootstrap Toast
                showBootstrapToast('Transaction updated successfully', 'success');
                
                // Reset form
                resetTransactionForm();
            }
        } else {
            // Add new transaction
            success = addTransaction(transactionData);
            
            if (success) {
                // Show success notification with Bootstrap Toast
                showBootstrapToast('Transaction added successfully', 'success');
                
                // Reset form but keep the type selected
                const selectedType = transactionData.type;
                form.reset();
                
                if (typeSelect) {
                    typeSelect.value = selectedType;
                    updateCategoryOptions();
                }
                
                // Reset date to today
                if (dateInput) {
                    dateInput.valueAsDate = new Date();
                }
            }
        }
        
        // Remove validation styling
        form.classList.remove('was-validated');
    });
}

// Function to show Bootstrap Toast
function showBootstrapToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create a unique ID for the toast
    const toastId = 'toast-' + Date.now();
    
    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center border-0 ${type === 'success' ? 'text-bg-success' : type === 'error' ? 'text-bg-danger' : 'text-bg-primary'}`;
    toastEl.id = toastId;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    // Create toast content
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add to container
    toastContainer.appendChild(toastEl);
    
    // Initialize and show the toast
    const toast = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: 3000
    });
    toast.show();
    
    // Remove from DOM after hidden
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}