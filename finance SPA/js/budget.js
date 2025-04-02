// Budget management functions

// Get current budget
function getCurrentBudget() {
    const budgets = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.BUDGETS)) || [];
    const currentMonth = new Date().toISOString().substr(0, 7); // Format: YYYY-MM
    
    // Find budget for current month
    let currentBudget = budgets.find(budget => budget.month === currentMonth);
    
    // If no budget exists for current month, create one
    if (!currentBudget) {
        currentBudget = {
            month: currentMonth,
            categories: []
        };
        
        // Add budget entries for all expense categories
        const categories = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.CATEGORIES)) || [];
        const expenseCategories = categories.filter(cat => cat.type === 'expense');
        
        currentBudget.categories = expenseCategories.map(category => ({
            categoryId: category.id,
            budgetAmount: 0,
            alert: 80 // Default alert at 80% of budget
        }));
        
        // Save the new budget
        budgets.push(currentBudget);
        localStorage.setItem(APP_STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    }
    
    return currentBudget;
}

// Update budget item
function updateBudgetItem(categoryId, budgetAmount, alert) {
    const budgets = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.BUDGETS)) || [];
    const currentMonth = new Date().toISOString().substr(0, 7);
    
    // Find budget for current month
    let budgetIndex = budgets.findIndex(budget => budget.month === currentMonth);
    
    // If no budget exists for current month, create one
    if (budgetIndex === -1) {
        const newBudget = {
            month: currentMonth,
            categories: []
        };
        budgets.push(newBudget);
        budgetIndex = budgets.length - 1;
    }
    
    // Find category in budget
    const categoryIndex = budgets[budgetIndex].categories.findIndex(
        cat => cat.categoryId === categoryId
    );
    
    if (categoryIndex === -1) {
        // Add new category budget
        budgets[budgetIndex].categories.push({
            categoryId,
            budgetAmount,
            alert
        });
    } else {
        // Update existing category budget
        budgets[budgetIndex].categories[categoryIndex] = {
            categoryId,
            budgetAmount,
            alert
        };
    }
    
    // Save updated budgets
    localStorage.setItem(APP_STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    showNotification('Budget updated successfully', 'success');
    
    // Re-render budget displays
    renderBudgetSettings();
    renderBudgetProgress();
    renderBudgetOverview();
    
    return true;
}

// Calculate budget status by category
function calculateBudgetStatus() {
    const currentBudget = getCurrentBudget();
    const transactions = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.TRANSACTIONS)) || [];
    const categories = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.CATEGORIES)) || [];
    
    // Get current month's expenses
    const currentDate = new Date();
    const currentMonthStr = currentDate.toISOString().substr(0, 7);
    
    const currentMonthTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        const transMonth = transDate.toISOString().substr(0, 7);
        return t.type === 'expense' && transMonth === currentMonthStr;
    });
    
    // Calculate spending by category
    const spendingByCategory = {};
    currentMonthTransactions.forEach(trans => {
        if (!spendingByCategory[trans.category]) {
            spendingByCategory[trans.category] = 0;
        }
        spendingByCategory[trans.category] += parseFloat(trans.amount);
    });
    
    // Calculate status for each budget category
    return currentBudget.categories.map(budgetCat => {
        const categoryInfo = categories.find(c => c.id === budgetCat.categoryId) || { name: 'Unknown', color: '#ccc' };
        const spent = spendingByCategory[budgetCat.categoryId] || 0;
        const percentage = budgetCat.budgetAmount > 0 ? (spent / budgetCat.budgetAmount) * 100 : 0;
        const remaining = budgetCat.budgetAmount - spent;
        
        let status = 'good'; // Under alert threshold
        if (percentage >= 100) {
            status = 'over';
        } else if (percentage >= budgetCat.alert) {
            status = 'warning';
        }
        
        return {
            categoryId: budgetCat.categoryId,
            categoryName: categoryInfo.name,
            categoryColor: categoryInfo.color,
            budgeted: budgetCat.budgetAmount,
            spent,
            remaining,
            percentage,
            status,
            alert: budgetCat.alert
        };
    }).filter(item => item.budgeted > 0); // Only include categories with a budget
}

// Render budget settings form
function renderBudgetSettings() {
    const budgetSettingsElement = document.getElementById('budget-settings');
    if (!budgetSettingsElement) return;
    
    const currentBudget = getCurrentBudget();
    const categories = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.CATEGORIES)) || [];
    const expenseCategories = categories.filter(cat => cat.type === 'expense');
    
    // Update month display
    const budgetMonthElement = document.getElementById('budget-month');
    if (budgetMonthElement) {
        const [year, month] = currentBudget.month.split('-');
        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
        budgetMonthElement.textContent = `${monthName} ${year}`;
    }
    
    // Create form
    const form = document.createElement('form');
    form.id = 'budget-form';
    
    // Build form content
    expenseCategories.forEach(category => {
        // Find budget for this category
        const categoryBudget = currentBudget.categories.find(
            cat => cat.categoryId === category.id
        ) || { budgetAmount: 0, alert: 80 };
        
        const formGroup = document.createElement('div');
        formGroup.className = 'budget-category-item';
        
        // Category color indicator and name
        const categoryLabel = document.createElement('div');
        categoryLabel.className = 'category-label';
        categoryLabel.innerHTML = `
            <span class="category-color" style="background-color: ${category.color}"></span>
            <label for="budget-${category.id}">${category.name}</label>
        `;
        
        // Budget amount input
        const amountInput = document.createElement('div');
        amountInput.className = 'amount-input';
        amountInput.innerHTML = `
            <input type="number" id="budget-${category.id}" 
                   name="budget-${category.id}" 
                   min="0" step="1" 
                   value="${categoryBudget.budgetAmount}">
            <input type="hidden" id="alert-${category.id}" 
                   name="alert-${category.id}" 
                   value="${categoryBudget.alert}">
        `;
        
        // Add to form group
        formGroup.appendChild(categoryLabel);
        formGroup.appendChild(amountInput);
        form.appendChild(formGroup);
    });
    
    // Add save button
    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.textContent = 'Save Budget';
    form.appendChild(saveButton);
    
    // Add event listener
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Save each category budget
        expenseCategories.forEach(category => {
            const budgetAmount = parseFloat(document.getElementById(`budget-${category.id}`).value) || 0;
            const alert = parseFloat(document.getElementById(`alert-${category.id}`).value) || 80;
            
            updateBudgetItem(category.id, budgetAmount, alert);
        });
    });
    
    // Update DOM
    budgetSettingsElement.innerHTML = '';
    budgetSettingsElement.appendChild(form);
}

// Render budget progress
function renderBudgetProgress() {
    const budgetProgressElement = document.getElementById('budget-progress');
    if (!budgetProgressElement) return;
    
    const budgetStatus = calculateBudgetStatus();
    
    if (budgetStatus.length === 0) {
        budgetProgressElement.innerHTML = '<p>No budget items found. Set your budget to see progress.</p>';
        return;
    }
    
    // Create budget progress display
    const progressContainer = document.createElement('div');
    progressContainer.className = 'budget-progress-container';
    
    budgetStatus.forEach(item => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'budget-category-progress';
        
        // Get appropriate class based on status
        let statusClass = '';
        if (item.status === 'over') {
            statusClass = 'danger';
        } else if (item.status === 'warning') {
            statusClass = 'warning';
        }
        
        // Create progress bar capped at 100% for visual display
        const displayPercentage = Math.min(item.percentage, 100);
        
        categoryElement.innerHTML = `
            <div class="category-info">
                <span class="category-color" style="background-color: ${item.categoryColor}"></span>
                <span class="category-name">${item.categoryName}</span>
                <span class="budget-amount">${formatCurrency(item.budgeted)}</span>
            </div>
            <div class="progress-info">
                <div class="progress-container">
                    <div class="progress-bar ${statusClass}" style="width: ${displayPercentage}%"></div>
                </div>
                <div class="amounts">
                    <span class="spent-amount">Spent: ${formatCurrency(item.spent)}</span>
                    <span class="remaining-amount ${item.remaining < 0 ? 'negative' : ''}">
                        Remaining: ${formatCurrency(item.remaining)}
                    </span>
                </div>
            </div>
        `;
        
        progressContainer.appendChild(categoryElement);
    });
    
    // Update DOM
    budgetProgressElement.innerHTML = '';
    budgetProgressElement.appendChild(progressContainer);
}

// Render budget overview for dashboard
function renderBudgetOverview() {
    const budgetOverviewElement = document.getElementById('budget-overview');
    if (!budgetOverviewElement) return;
    
    const budgetStatus = calculateBudgetStatus();
    
    if (budgetStatus.length === 0) {
        budgetOverviewElement.innerHTML = '<p>No budget items found. Go to the Budget page to set up your budget.</p>';
        return;
    }
    
    // Sort by status - show over budget first, then warnings
    budgetStatus.sort((a, b) => {
        if (a.status === 'over' && b.status !== 'over') return -1;
        if (a.status !== 'over' && b.status === 'over') return 1;
        if (a.status === 'warning' && b.status === 'good') return -1;
        if (a.status === 'good' && b.status === 'warning') return 1;
        return 0;
    });
    
    // Create budget overview display - simpler version for dashboard
    const overviewList = document.createElement('ul');
    overviewList.className = 'budget-overview-list';
    
    budgetStatus.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = `budget-overview-item status-${item.status}`;
        
        listItem.innerHTML = `
            <div class="category-info">
                <span class="category-color" style="background-color: ${item.categoryColor}"></span>
                <span class="category-name">${item.categoryName}</span>
            </div>
            <div class="budget-progress-mini">
                <div class="progress-container">
                    <div class="progress-bar ${item.status === 'over' ? 'danger' : (item.status === 'warning' ? 'warning' : '')}" 
                         style="width: ${Math.min(item.percentage, 100)}%"></div>
                </div>
                <span class="percentage">${Math.round(item.percentage)}%</span>
            </div>
        `;
        
        overviewList.appendChild(listItem);
    });
    
    // Update DOM
    budgetOverviewElement.innerHTML = '';
    budgetOverviewElement.appendChild(overviewList);
}

// Set/update budget for a category
function setBudget(categoryName, amount) {
    // Validate amount
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        showNotification('Please enter a valid budget amount.', 'error');
        return false;
    }
    
    // Get current budgets
    const budgets = JSON.parse(localStorage.getItem('budgets')) || [];
    
    // Check if budget for this category already exists
    const existingIndex = budgets.findIndex(b => b.category === categoryName);
    
    if (existingIndex !== -1) {
        // Update existing budget
        budgets[existingIndex].amount = parseFloat(amount);
        budgets[existingIndex].updatedAt = new Date().toISOString();
    } else {
        // Create new budget
        budgets.push({
            id: generateUUID(),
            category: categoryName,
            amount: parseFloat(amount),
            createdAt: new Date().toISOString()
        });
    }
    
    // Save to local storage
    localStorage.setItem('budgets', JSON.stringify(budgets));
    
    // Show success notification
    showNotification('Budget saved successfully.', 'success');
    
    // Refresh budget progress
    renderBudgetProgress();
    
    // Clear form
    const budgetForm = document.getElementById('budget-form');
    if (budgetForm) {
        budgetForm.reset();
    }
    
    return true;
}

// Delete budget for a category
function deleteBudget(budgetId) {
    // Show confirmation dialog
    showConfirmation('Are you sure you want to delete this budget?', () => {
        // Get current budgets
        const budgets = JSON.parse(localStorage.getItem('budgets')) || [];
        
        // Filter out the budget to delete
        const updatedBudgets = budgets.filter(b => b.id !== budgetId);
        
        // Save to local storage
        localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
        
        // Show success notification
        showNotification('Budget deleted successfully.', 'success');
        
        // Refresh budget progress
        renderBudgetProgress();
    });
}

// Render budget settings form
function renderBudgetSettings() {
    // Populate category dropdown
    const categorySelect = document.getElementById('budget-category');
    if (categorySelect) {
        // Get expense categories
        const categories = getCategories().expense || [];
        
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
    
    // Add form event listener
    const budgetForm = document.getElementById('budget-form');
    if (budgetForm) {
        budgetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const categoryName = document.getElementById('budget-category').value;
            const amount = document.getElementById('budget-amount').value;
            
            setBudget(categoryName, amount);
        });
    }
}

// Render budget progress
function renderBudgetProgress() {
    const container = document.getElementById('budget-progress');
    if (!container) return;
    
    // Get current month
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const dayOfMonth = currentDate.getDate();
    const monthProgress = (dayOfMonth / daysInMonth) * 100;
    
    // Get budgets and expenses
    const budgets = JSON.parse(localStorage.getItem('budgets')) || [];
    const transactions = getTransactions({ 
        type: 'expense', 
        month: currentMonth 
    });
    
    // Check if there are budgets
    if (budgets.length === 0) {
        container.innerHTML = '<p class="no-data">No budgets set. Use the form to create your first budget.</p>';
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
    
    // Clear container
    container.innerHTML = '';
    
    // Add month progress indicator
    const monthProgressContainer = document.createElement('div');
    monthProgressContainer.className = 'month-progress-container';
    
    const monthProgressLabel = document.createElement('div');
    monthProgressLabel.className = 'month-progress-label';
    monthProgressLabel.textContent = `Month Progress: ${Math.round(monthProgress)}%`;
    
    const monthProgressTrack = document.createElement('div');
    monthProgressTrack.className = 'progress-track';
    
    const monthProgressBar = document.createElement('div');
    monthProgressBar.className = 'progress-bar month-progress';
    monthProgressBar.style.width = `${monthProgress}%`;
    
    monthProgressTrack.appendChild(monthProgressBar);
    monthProgressContainer.appendChild(monthProgressLabel);
    monthProgressContainer.appendChild(monthProgressTrack);
    
    container.appendChild(monthProgressContainer);
    
    // Create budget progress bars
    const budgetList = document.createElement('div');
    budgetList.className = 'budget-list';
    
    budgets.forEach(budget => {
        const spent = expensesByCategory[budget.category] || 0;
        const percentage = calculateProgressPercentage(spent, budget.amount);
        
        // Create budget item container
        const budgetItem = document.createElement('div');
        budgetItem.className = 'budget-item';
        
        // Create budget header with category and actions
        const budgetHeader = document.createElement('div');
        budgetHeader.className = 'budget-header';
        
        const categoryName = document.createElement('h4');
        categoryName.textContent = budget.category;
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-small btn-danger';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            deleteBudget(budget.id);
        });
        
        budgetHeader.appendChild(categoryName);
        budgetHeader.appendChild(deleteButton);
        
        // Create budget details
        const budgetDetails = document.createElement('div');
        budgetDetails.className = 'budget-details';
        
        const amountDetails = document.createElement('div');
        amountDetails.className = 'amount-details';
        amountDetails.innerHTML = `
            <span class="spent-amount">${formatCurrency(spent)}</span>
            <span class="separator">of</span>
            <span class="budget-amount">${formatCurrency(budget.amount)}</span>
        `;
        
        // Set color based on percentage of budget used vs month progress
        let color = '#4CAF50'; // Green
        
        // If spending is ahead of month progress
        if (percentage > monthProgress + 10) {
            color = '#F44336'; // Red
        } 
        // If spending is close to month progress
        else if (percentage > monthProgress - 10) {
            color = '#FFC107'; // Yellow
        }
        
        // Create progress bar
        const progressTrack = document.createElement('div');
        progressTrack.className = 'progress-track';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.width = `${percentage}%`;
        progressBar.style.backgroundColor = color;
        
        // Add month progress marker
        const monthMarker = document.createElement('div');
        monthMarker.className = 'month-marker';
        monthMarker.style.left = `${monthProgress}%`;
        
        // Add warning if over budget
        if (spent > budget.amount) {
            const warning = document.createElement('div');
            warning.className = 'budget-warning';
            warning.textContent = 'Over budget!';
            budgetDetails.appendChild(warning);
        }
        
        progressTrack.appendChild(progressBar);
        progressTrack.appendChild(monthMarker);
        
        // Assemble budget item
        budgetItem.appendChild(budgetHeader);
        budgetItem.appendChild(amountDetails);
        budgetItem.appendChild(progressTrack);
        
        budgetList.appendChild(budgetItem);
    });
    
    container.appendChild(budgetList);
} 