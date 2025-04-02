// Savings goals management functions

// Create new savings goal
function createSavingsGoal(goalData) {
    // Validate goal data
    if (!validateSavingsGoal(goalData)) {
        showNotification('Invalid savings goal data', 'error');
        return false;
    }
    
    // Get existing goals
    const goals = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.SAVINGS_GOALS)) || [];
    
    // Create new goal object
    const newGoal = {
        id: generateId('goal-'),
        name: goalData.name,
        targetAmount: parseFloat(goalData.targetAmount),
        currentAmount: parseFloat(goalData.initialAmount || 0),
        targetDate: goalData.targetDate,
        createdAt: new Date().toISOString(),
        isCompleted: false,
        contributions: []
    };
    
    // Add initial contribution if provided
    if (goalData.initialAmount && parseFloat(goalData.initialAmount) > 0) {
        newGoal.contributions.push({
            date: new Date().toISOString(),
            amount: parseFloat(goalData.initialAmount),
            notes: 'Initial deposit'
        });
    }
    
    // Check if goal is already completed
    if (newGoal.currentAmount >= newGoal.targetAmount) {
        newGoal.isCompleted = true;
        newGoal.completedAt = new Date().toISOString();
    }
    
    // Add to goals array and save
    goals.push(newGoal);
    localStorage.setItem(APP_STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
    
    // Update UI
    renderSavingsGoals();
    renderSavingsGoalsOverview();
    showNotification('Savings goal created successfully', 'success');
    
    return true;
}

// Add contribution to a savings goal
function addContribution(goalId, contributionData) {
    // Validate contribution
    if (!contributionData.amount || parseFloat(contributionData.amount) <= 0) {
        showNotification('Invalid contribution amount', 'error');
        return false;
    }
    
    // Get goals
    const goals = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.SAVINGS_GOALS)) || [];
    const goalIndex = goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) {
        showNotification('Savings goal not found', 'error');
        return false;
    }
    
    // Create contribution object
    const contribution = {
        date: new Date().toISOString(),
        amount: parseFloat(contributionData.amount),
        notes: contributionData.notes || ''
    };
    
    // Add to goal
    goals[goalIndex].contributions.push(contribution);
    goals[goalIndex].currentAmount += contribution.amount;
    
    // Check if goal is now completed
    if (goals[goalIndex].currentAmount >= goals[goalIndex].targetAmount && !goals[goalIndex].isCompleted) {
        goals[goalIndex].isCompleted = true;
        goals[goalIndex].completedAt = new Date().toISOString();
    }
    
    // Save updated goals
    localStorage.setItem(APP_STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
    
    // Update UI
    renderSavingsGoals();
    renderSavingsGoalsOverview();
    showNotification('Contribution added successfully', 'success');
    
    return true;
}

// Delete a savings goal
function deleteSavingsGoal(goalId) {
    // Get goals
    const goals = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.SAVINGS_GOALS)) || [];
    
    // Filter out the goal to delete
    const updatedGoals = goals.filter(g => g.id !== goalId);
    
    if (updatedGoals.length === goals.length) {
        showNotification('Savings goal not found', 'error');
        return false;
    }
    
    // Save updated goals
    localStorage.setItem(APP_STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(updatedGoals));
    
    // Update UI
    renderSavingsGoals();
    renderSavingsGoalsOverview();
    showNotification('Savings goal deleted', 'success');
    
    return true;
}

// Validate savings goal data
function validateSavingsGoal(goal) {
    // Check required fields
    if (!goal.name || !goal.targetAmount || !goal.targetDate) {
        return false;
    }
    
    // Validate amount (must be positive)
    if (isNaN(goal.targetAmount) || parseFloat(goal.targetAmount) <= 0) {
        return false;
    }
    
    // Validate initial amount if provided
    if (goal.initialAmount && (isNaN(goal.initialAmount) || parseFloat(goal.initialAmount) < 0)) {
        return false;
    }
    
    // Validate date (must be in the future)
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (targetDate < today) {
        return false;
    }
    
    return true;
}

// Calculate days remaining until target date
function calculateDaysRemaining(targetDate) {
    const target = new Date(targetDate);
    const today = new Date();
    
    // Reset time portion for accurate day calculation
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // Calculate difference in milliseconds
    const diffMs = target - today;
    
    // Convert to days
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

// Calculate required saving per day/month to reach goal
function calculateRequiredSaving(goal) {
    const remaining = goal.targetAmount - goal.currentAmount;
    const daysRemaining = calculateDaysRemaining(goal.targetDate);
    
    if (daysRemaining <= 0) return { daily: 0, monthly: 0 };
    
    // Calculate daily and monthly amounts
    const daily = remaining / daysRemaining;
    const monthly = daily * 30; // Approximate
    
    return {
        daily,
        monthly
    };
}

// Render all savings goals
function renderSavingsGoals() {
    const savingsGoalsContainer = document.getElementById('savings-goals-container');
    if (!savingsGoalsContainer) return;
    
    // Get goals
    const goals = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.SAVINGS_GOALS)) || [];
    
    if (goals.length === 0) {
        savingsGoalsContainer.innerHTML = '<p>No savings goals found. Create a goal to get started.</p>';
        return;
    }
    
    // Create container for goals
    const goalsGrid = document.createElement('div');
    goalsGrid.className = 'savings-goals-grid';
    
    // Sort goals - active goals first, then by target date
    const sortedGoals = [...goals].sort((a, b) => {
        // Active goals first
        if (a.isCompleted && !b.isCompleted) return 1;
        if (!a.isCompleted && b.isCompleted) return -1;
        
        // Then by target date
        return new Date(a.targetDate) - new Date(b.targetDate);
    });
    
    // Create goal cards
    sortedGoals.forEach(goal => {
        const card = document.createElement('div');
        card.className = `card goal-card ${goal.isCompleted ? 'completed-goal' : ''}`;
        card.dataset.goalId = goal.id;
        
        // Calculate progress percentage
        const progressPercent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
        
        // Calculate days remaining
        const daysRemaining = calculateDaysRemaining(goal.targetDate);
        
        // Calculate required saving
        const requiredSaving = calculateRequiredSaving(goal);
        
        // Create goal card content
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${goal.name}</h3>
                <div class="goal-status">
                    ${goal.isCompleted 
                        ? '<span class="completed-badge">Completed</span>' 
                        : `<span class="days-remaining">${daysRemaining} days left</span>`}
                </div>
            </div>
            
            <div class="goal-progress">
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <div class="progress-text">
                    <span>${formatCurrency(goal.currentAmount)}</span>
                    <span>of</span>
                    <span>${formatCurrency(goal.targetAmount)}</span>
                </div>
                <div class="progress-percentage">${Math.round(progressPercent)}%</div>
            </div>
            
            <div class="goal-details">
                <div class="goal-target-date">
                    <strong>Target date:</strong> ${formatDate(goal.targetDate)}
                </div>
                ${!goal.isCompleted && daysRemaining > 0 ? `
                    <div class="goal-saving-required">
                        <strong>Required saving:</strong>
                        <div>Monthly: ${formatCurrency(requiredSaving.monthly)}</div>
                    </div>
                ` : ''}
            </div>
            
            ${!goal.isCompleted ? `
                <div class="goal-actions">
                    <button class="add-contribution-btn" data-goal-id="${goal.id}">Add Contribution</button>
                    <button class="view-contributions-btn" data-goal-id="${goal.id}">View Contributions</button>
                </div>
            ` : `
                <div class="goal-completion">
                    <p>Completed on ${formatDate(goal.completedAt)}</p>
                </div>
            `}
            
            <button class="delete-goal-btn" data-goal-id="${goal.id}">Delete Goal</button>
        `;
        
        goalsGrid.appendChild(card);
    });
    
    // Update DOM
    savingsGoalsContainer.innerHTML = '';
    savingsGoalsContainer.appendChild(goalsGrid);
    
    // Add event listeners for buttons
    document.querySelectorAll('.add-contribution-btn').forEach(button => {
        button.addEventListener('click', function() {
            const goalId = this.getAttribute('data-goal-id');
            showContributionForm(goalId);
        });
    });
    
    document.querySelectorAll('.view-contributions-btn').forEach(button => {
        button.addEventListener('click', function() {
            const goalId = this.getAttribute('data-goal-id');
            showContributionHistory(goalId);
        });
    });
    
    document.querySelectorAll('.delete-goal-btn').forEach(button => {
        button.addEventListener('click', function() {
            const goalId = this.getAttribute('data-goal-id');
            if (confirm('Are you sure you want to delete this savings goal?')) {
                deleteSavingsGoal(goalId);
            }
        });
    });
}

// Show contribution form for a goal
function showContributionForm(goalId) {
    const goals = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.SAVINGS_GOALS)) || [];
    const goal = goals.find(g => g.id === goalId);
    
    if (!goal) {
        showNotification('Goal not found', 'error');
        return;
    }
    
    // Create modal for contribution form
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add Contribution to ${goal.name}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <form id="contribution-form">
                <div class="form-group">
                    <label for="contribution-amount">Amount</label>
                    <input type="number" id="contribution-amount" min="0.01" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="contribution-notes">Notes (optional)</label>
                    <textarea id="contribution-notes"></textarea>
                </div>
                <button type="submit">Add Contribution</button>
            </form>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#contribution-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const amount = document.getElementById('contribution-amount').value;
        const notes = document.getElementById('contribution-notes').value;
        
        if (addContribution(goalId, { amount, notes })) {
            document.body.removeChild(modal);
        }
    });
    
    // Close modal if clicked outside content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Focus on amount input
    setTimeout(() => {
        document.getElementById('contribution-amount').focus();
    }, 100);
}

// Show contribution history for a goal
function showContributionHistory(goalId) {
    const goals = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.SAVINGS_GOALS)) || [];
    const goal = goals.find(g => g.id === goalId);
    
    if (!goal) {
        showNotification('Goal not found', 'error');
        return;
    }
    
    // Create modal for contribution history
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Generate contribution list HTML
    let contributionsHtml = '';
    if (goal.contributions.length === 0) {
        contributionsHtml = '<p>No contributions yet.</p>';
    } else {
        const sortedContributions = [...goal.contributions].sort((a, b) => 
            new Date(b.date) - new Date(a.date));
        
        contributionsHtml = `
            <table class="contributions-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedContributions.map(contribution => `
                        <tr>
                            <td>${formatDate(contribution.date)}</td>
                            <td>${formatCurrency(contribution.amount)}</td>
                            <td>${contribution.notes || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td><strong>Total</strong></td>
                        <td><strong>${formatCurrency(goal.currentAmount)}</strong></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        `;
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Contributions for ${goal.name}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                ${contributionsHtml}
            </div>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(modal);
    
    // Add event listener to close button
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close modal if clicked outside content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Render savings goals overview for dashboard
function renderSavingsGoalsOverview() {
    const overviewElement = document.getElementById('savings-goals-overview');
    if (!overviewElement) return;
    
    // Get goals
    const goals = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.SAVINGS_GOALS)) || [];
    
    if (goals.length === 0) {
        overviewElement.innerHTML = '<p>No savings goals found. Go to the Savings Goals page to create a goal.</p>';
        return;
    }
    
    // Filter out completed goals and sort by percentage complete (ascending)
    const activeGoals = goals
        .filter(goal => !goal.isCompleted)
        .sort((a, b) => {
            const percentA = (a.currentAmount / a.targetAmount) * 100;
            const percentB = (b.currentAmount / b.targetAmount) * 100;
            return percentA - percentB;
        });
    
    if (activeGoals.length === 0) {
        overviewElement.innerHTML = `
            <p>All savings goals completed! <a href="#/savings">Create a new goal</a>.</p>
        `;
        return;
    }
    
    // Create overview list
    const overviewList = document.createElement('ul');
    overviewList.className = 'savings-overview-list';
    
    // Show up to 3 active goals
    activeGoals.slice(0, 3).forEach(goal => {
        const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;
        const daysRemaining = calculateDaysRemaining(goal.targetDate);
        
        const listItem = document.createElement('li');
        listItem.className = 'savings-overview-item';
        listItem.innerHTML = `
            <div class="goal-info">
                <span class="goal-name">${goal.name}</span>
                <span class="goal-target">${formatCurrency(goal.targetAmount)}</span>
            </div>
            <div class="goal-progress">
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <div class="goal-progress-details">
                    <span class="progress-amount">${formatCurrency(goal.currentAmount)}</span>
                    <span class="days-remaining">${daysRemaining} days left</span>
                </div>
            </div>
        `;
        
        overviewList.appendChild(listItem);
    });
    
    // Update DOM
    overviewElement.innerHTML = '';
    overviewElement.appendChild(overviewList);
} 