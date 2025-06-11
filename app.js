// Task Management Pro Application
class TaskManager {
    constructor() {
        this.tasks = [];
        this.users = ["田中太郎", "山田花子", "鈴木一郎", "高橋美咲", "佐藤部長"];
        this.statuses = ["未開始", "進行中", "レビュー中", "完了"];
        this.priorities = ["低", "中", "高"];
        this.currentDate = new Date(2025, 5, 11); // June 11, 2025
        this.currentView = 'list';
        this.calendarView = 'month';
        this.calendarDate = new Date(2025, 5, 11);
        this.showSubtasks = true;
        this.editingTaskId = null;
        this.userToDelete = null;
        
        this.init();
    }

    init() {
        this.loadSampleData();
        this.setupEventListeners();
        this.populateDropdowns();
        this.updateView();
        this.updateStats();
    }

    loadSampleData() {
        const sampleTasks = [
            {
                id: 1,
                name: "ウェブサイトリニューアルプロジェクト",
                assignee: "田中太郎",
                assigner: "佐藤部長",
                estimatedHours: 120,
                startDate: "2025-06-10",
                deadline: "2025-07-15",
                status: "進行中",
                priority: "高",
                memo: "企業サイトの全面リニューアル。SEO対策も含む。",
                parentId: null,
                childTasks: [2, 3, 4]
            },
            {
                id: 2,
                name: "要件定義・企画",
                assignee: "田中太郎",
                assigner: "佐藤部長",
                estimatedHours: 24,
                startDate: "2025-06-10",
                deadline: "2025-06-20",
                status: "完了",
                priority: "高",
                memo: "クライアント要件のヒアリング、企画書作成",
                parentId: 1,
                childTasks: []
            },
            {
                id: 3,
                name: "デザイン制作",
                assignee: "山田花子",
                assigner: "田中太郎",
                estimatedHours: 48,
                startDate: "2025-06-21",
                deadline: "2025-07-05",
                status: "進行中",
                priority: "高",
                memo: "ワイヤーフレーム、デザインカンプ、スタイルガイド作成",
                parentId: 1,
                childTasks: []
            },
            {
                id: 4,
                name: "開発・実装",
                assignee: "鈴木一郎",
                assigner: "田中太郎",
                estimatedHours: 48,
                startDate: "2025-07-06",
                deadline: "2025-07-15",
                status: "未開始",
                priority: "高",
                memo: "HTML/CSS/JavaScript実装、CMS構築",
                parentId: 1,
                childTasks: []
            },
            {
                id: 5,
                name: "マーケティング戦略立案",
                assignee: "高橋美咲",
                assigner: "佐藤部長",
                estimatedHours: 32,
                startDate: "2025-06-12",
                deadline: "2025-06-25",
                status: "未開始",
                priority: "中",
                memo: "Q3のマーケティング戦略を策定。競合分析も含む。",
                parentId: null,
                childTasks: [6, 7]
            },
            {
                id: 6,
                name: "競合分析",
                assignee: "高橋美咲",
                assigner: "佐藤部長",
                estimatedHours: 16,
                startDate: "2025-06-12",
                deadline: "2025-06-18",
                status: "未開始",
                priority: "中",
                memo: "主要競合3社の分析レポート作成",
                parentId: 5,
                childTasks: []
            },
            {
                id: 7,
                name: "戦略書作成",
                assignee: "高橋美咲",
                assigner: "佐藤部長",
                estimatedHours: 16,
                startDate: "2025-06-19",
                deadline: "2025-06-25",
                status: "未開始",
                priority: "中",
                memo: "分析結果を基にした戦略提案書の作成",
                parentId: 5,
                childTasks: []
            }
        ];
        
        this.tasks = sampleTasks;
        console.log('Sample data loaded:', this.tasks);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // New task button
        document.getElementById('new-task-btn').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterTasks();
        });

        document.getElementById('user-search-input').addEventListener('input', (e) => {
            this.filterUsers();
        });

        // Filters
        document.getElementById('status-filter').addEventListener('change', () => this.filterTasks());
        document.getElementById('priority-filter').addEventListener('change', () => this.filterTasks());
        document.getElementById('assignee-filter').addEventListener('change', () => this.filterTasks());

        // Calendar controls
        document.getElementById('prev-period').addEventListener('click', () => this.navigateCalendar(-1));
        document.getElementById('next-period').addEventListener('click', () => this.navigateCalendar(1));
        document.getElementById('today-btn').addEventListener('click', () => this.goToToday());

        // Calendar view switcher
        document.querySelectorAll('[data-calendar-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.calendarView;
                this.switchCalendarView(view);
            });
        });

        // Timeline controls
        document.getElementById('toggle-subtasks').addEventListener('click', () => {
            this.showSubtasks = !this.showSubtasks;
            this.updateTimelineView();
        });

        // Task modal controls
        document.getElementById('modal-close').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('modal-cancel').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('modal-save').addEventListener('click', () => this.saveTask());
        document.getElementById('task-modal').addEventListener('click', (e) => {
            if (e.target.id === 'task-modal') this.closeTaskModal();
        });

        // User management controls
        document.getElementById('add-user-btn').addEventListener('click', () => this.openAddUserModal());
        document.getElementById('add-user-modal-close').addEventListener('click', () => this.closeAddUserModal());
        document.getElementById('add-user-cancel').addEventListener('click', () => this.closeAddUserModal());
        document.getElementById('add-user-save').addEventListener('click', () => this.saveUser());
        document.getElementById('add-user-modal').addEventListener('click', (e) => {
            if (e.target.id === 'add-user-modal') this.closeAddUserModal();
        });

        // User deletion controls
        document.getElementById('delete-user-modal-close').addEventListener('click', () => this.closeDeleteUserModal());
        document.getElementById('delete-user-cancel').addEventListener('click', () => this.closeDeleteUserModal());
        document.getElementById('delete-user-confirm').addEventListener('click', () => this.confirmDeleteUser());
        document.getElementById('delete-user-modal').addEventListener('click', (e) => {
            if (e.target.id === 'delete-user-modal') this.closeDeleteUserModal();
        });

        // User name validation
        document.getElementById('new-user-name').addEventListener('input', () => this.validateUserName());

        // Task action radio buttons
        document.querySelectorAll('input[name="task-action"]').forEach(radio => {
            radio.addEventListener('change', () => this.toggleReassignOptions());
        });
    }

    populateDropdowns() {
        // Populate user dropdowns
        const assigneeSelects = [
            document.getElementById('assignee-filter'),
            document.getElementById('task-assignee'),
            document.getElementById('task-assigner')
        ];

        assigneeSelects.forEach(select => {
            if (select) {
                // Clear existing options (except first one for filters)
                const isFilter = select.id.includes('filter');
                while (select.children.length > (isFilter ? 1 : 0)) {
                    select.removeChild(select.lastChild);
                }

                this.users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user;
                    option.textContent = user;
                    select.appendChild(option);
                });
            }
        });

        // Populate parent task dropdown
        this.updateParentTaskDropdown();
    }

    updateParentTaskDropdown() {
        const parentSelect = document.getElementById('task-parent');
        if (!parentSelect) return;

        // Clear existing options except the first one
        while (parentSelect.children.length > 1) {
            parentSelect.removeChild(parentSelect.lastChild);
        }

        // Add parent tasks (tasks without parentId)
        this.tasks.filter(task => !task.parentId).forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.name;
            parentSelect.appendChild(option);
        });
    }

    switchView(view) {
        this.currentView = view;
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Update view title
        const titles = {
            list: 'リスト表示',
            calendar: 'カレンダー表示',
            timeline: 'タイムライン表示',
            stats: '統計ダッシュボード',
            users: 'ユーザー管理'
        };
        document.getElementById('view-title').textContent = titles[view];

        // Show/hide views
        document.querySelectorAll('.view-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${view}-view`).classList.add('active');

        this.updateView();
    }

    updateView() {
        switch (this.currentView) {
            case 'list':
                this.updateListView();
                break;
            case 'calendar':
                this.updateCalendarView();
                break;
            case 'timeline':
                this.updateTimelineView();
                break;
            case 'stats':
                this.updateStats();
                break;
            case 'users':
                this.updateUsersView();
                break;
        }
    }

    // User Management Functions
    updateUsersView() {
        const tableBody = document.getElementById('users-table-body');
        const searchTerm = document.getElementById('user-search-input').value.toLowerCase();
        
        const filteredUsers = searchTerm 
            ? this.users.filter(user => user.toLowerCase().includes(searchTerm))
            : this.users;

        tableBody.innerHTML = '';

        filteredUsers.forEach(user => {
            const userStats = this.getUserStats(user);
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>
                    <strong>${user}</strong>
                </td>
                <td>${userStats.assignedTasks}</td>
                <td>${userStats.instructedTasks}</td>
                <td>
                    <div class="completion-rate">
                        <div class="completion-bar">
                            <div class="completion-fill" style="width: ${userStats.completionRate}%"></div>
                        </div>
                        <span class="completion-text">${userStats.completionRate}%</span>
                    </div>
                </td>
                <td>
                    <div class="user-actions">
                        <button class="delete-btn" onclick="taskManager.deleteUser('${user}')" title="削除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });

        if (filteredUsers.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="5" style="text-align: center; padding: var(--space-24); color: var(--color-text-secondary);">
                    ${searchTerm ? 'ユーザーが見つかりません' : 'ユーザーがありません'}
                </td>
            `;
            tableBody.appendChild(row);
        }
    }

    getUserStats(userName) {
        const assignedTasks = this.tasks.filter(task => task.assignee === userName);
        const instructedTasks = this.tasks.filter(task => task.assigner === userName);
        
        const completedAssigned = assignedTasks.filter(task => task.status === '完了').length;
        const completionRate = assignedTasks.length > 0 
            ? Math.round((completedAssigned / assignedTasks.length) * 100) 
            : 0;

        return {
            assignedTasks: assignedTasks.length,
            instructedTasks: instructedTasks.length,
            completionRate: completionRate
        };
    }

    filterUsers() {
        this.updateUsersView();
    }

    // Add User Modal Functions
    openAddUserModal() {
        document.getElementById('new-user-name').value = '';
        document.getElementById('user-name-feedback').textContent = '';
        document.getElementById('user-name-feedback').className = 'form-feedback';
        document.getElementById('add-user-modal').classList.add('active');
        document.getElementById('new-user-name').focus();
    }

    closeAddUserModal() {
        document.getElementById('add-user-modal').classList.remove('active');
    }

    validateUserName() {
        const nameInput = document.getElementById('new-user-name');
        const feedback = document.getElementById('user-name-feedback');
        const userName = nameInput.value.trim();

        if (!userName) {
            feedback.textContent = '';
            feedback.className = 'form-feedback';
            return false;
        }

        if (this.users.includes(userName)) {
            feedback.textContent = 'このユーザー名は既に存在します';
            feedback.className = 'form-feedback error';
            return false;
        }

        if (userName.length < 2) {
            feedback.textContent = 'ユーザー名は2文字以上で入力してください';
            feedback.className = 'form-feedback error';
            return false;
        }

        if (userName.length > 20) {
            feedback.textContent = 'ユーザー名は20文字以下で入力してください';
            feedback.className = 'form-feedback error';
            return false;
        }

        feedback.textContent = '利用可能なユーザー名です';
        feedback.className = 'form-feedback success';
        return true;
    }

    saveUser() {
        const userName = document.getElementById('new-user-name').value.trim();
        
        if (!this.validateUserName()) {
            this.showToast('入力内容を確認してください', 'error');
            return;
        }

        this.users.push(userName);
        this.populateDropdowns();
        this.updateUsersView();
        this.closeAddUserModal();
        this.showToast(`ユーザー「${userName}」を追加しました`, 'success');
    }

    // Delete User Functions
    deleteUser(userName) {
        this.userToDelete = userName;
        
        // Get related tasks
        const relatedTasks = this.tasks.filter(task => 
            task.assignee === userName || task.assigner === userName
        );

        document.getElementById('delete-user-message').textContent = 
            `ユーザー「${userName}」を削除しますか？`;

        const warningDiv = document.getElementById('delete-user-task-warning');
        const tasksList = document.getElementById('related-tasks-list');
        
        if (relatedTasks.length > 0) {
            warningDiv.classList.remove('hidden');
            tasksList.innerHTML = '';
            
            relatedTasks.forEach(task => {
                const li = document.createElement('li');
                const roles = [];
                if (task.assignee === userName) roles.push('担当者');
                if (task.assigner === userName) roles.push('指示者');
                li.textContent = `${task.name} (${roles.join('・')})`;
                tasksList.appendChild(li);
            });

            // Populate reassign dropdown
            const reassignSelect = document.getElementById('reassign-user');
            reassignSelect.innerHTML = '<option value="">選択してください</option>';
            this.users.filter(user => user !== userName).forEach(user => {
                const option = document.createElement('option');
                option.value = user;
                option.textContent = user;
                reassignSelect.appendChild(option);
            });

            // Reset radio buttons
            document.getElementById('reassign-tasks').checked = true;
            this.toggleReassignOptions();
        } else {
            warningDiv.classList.add('hidden');
        }

        document.getElementById('delete-user-modal').classList.add('active');
    }

    toggleReassignOptions() {
        const reassignSelected = document.getElementById('reassign-tasks').checked;
        const reassignOptions = document.getElementById('reassign-options');
        
        if (reassignSelected) {
            reassignOptions.style.display = 'block';
        } else {
            reassignOptions.style.display = 'none';
        }
    }

    closeDeleteUserModal() {
        document.getElementById('delete-user-modal').classList.remove('active');
        this.userToDelete = null;
    }

    confirmDeleteUser() {
        if (!this.userToDelete) return;

        const relatedTasks = this.tasks.filter(task => 
            task.assignee === this.userToDelete || task.assigner === this.userToDelete
        );

        if (relatedTasks.length > 0) {
            const action = document.querySelector('input[name="task-action"]:checked').value;
            
            if (action === 'reassign') {
                const reassignUser = document.getElementById('reassign-user').value;
                if (!reassignUser) {
                    this.showToast('再割り当て先ユーザーを選択してください', 'error');
                    return;
                }

                // Reassign tasks
                relatedTasks.forEach(task => {
                    if (task.assignee === this.userToDelete) {
                        task.assignee = reassignUser;
                    }
                    if (task.assigner === this.userToDelete) {
                        task.assigner = reassignUser;
                    }
                });

                this.showToast(`${relatedTasks.length}個のタスクを「${reassignUser}」に再割り当てしました`, 'info');
            } else {
                // Unassign tasks
                relatedTasks.forEach(task => {
                    if (task.assignee === this.userToDelete) {
                        task.assignee = '';
                    }
                    if (task.assigner === this.userToDelete) {
                        task.assigner = '';
                    }
                });

                this.showToast(`${relatedTasks.length}個のタスクの担当者/指示者を未設定にしました`, 'info');
            }
        }

        // Remove user
        this.users = this.users.filter(user => user !== this.userToDelete);
        
        this.populateDropdowns();
        this.updateUsersView();
        this.updateView(); // Update current view to reflect changes
        this.closeDeleteUserModal();
        
        this.showToast(`ユーザー「${this.userToDelete}」を削除しました`, 'success');
    }

    // Existing task management functions (keeping all previous functionality)
    updateListView() {
        const container = document.getElementById('task-list');
        const filteredTasks = this.getFilteredTasks();
        
        container.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            container.innerHTML = '<p>タスクが見つかりません。</p>';
            return;
        }
        
        // Organize tasks by hierarchy
        const parentTasks = filteredTasks.filter(task => !task.parentId);
        
        parentTasks.forEach(parentTask => {
            container.appendChild(this.createTaskElement(parentTask));
            
            // Add child tasks
            const childTasks = filteredTasks.filter(task => task.parentId === parentTask.id);
            childTasks.forEach(childTask => {
                container.appendChild(this.createTaskElement(childTask, true));
            });
        });

        // Add orphaned child tasks (if parent is filtered out)
        const orphanedTasks = filteredTasks.filter(task => 
            task.parentId && !parentTasks.some(p => p.id === task.parentId)
        );
        orphanedTasks.forEach(task => {
            container.appendChild(this.createTaskElement(task, true));
        });
    }

    createTaskElement(task, isChild = false) {
        const element = document.createElement('div');
        element.className = `task-item ${isChild ? 'child-task' : 'parent-task'}`;
        element.dataset.taskId = task.id;

        element.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${task.name}</h3>
                <div class="task-actions">
                    <button onclick="taskManager.editTask(${task.id})" title="編集">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="taskManager.deleteTask(${task.id})" title="削除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="task-meta">
                <div class="task-meta-item">
                    <div class="task-meta-label">担当者</div>
                    <div class="task-meta-value">${task.assignee || '未設定'}</div>
                </div>
                <div class="task-meta-item">
                    <div class="task-meta-label">指示者</div>
                    <div class="task-meta-value">${task.assigner || '未設定'}</div>
                </div>
                <div class="task-meta-item">
                    <div class="task-meta-label">所要時間</div>
                    <div class="task-meta-value">${task.estimatedHours || 0}時間</div>
                </div>
                <div class="task-meta-item">
                    <div class="task-meta-label">開始日</div>
                    <div class="task-meta-value">${this.formatDate(task.startDate)}</div>
                </div>
                <div class="task-meta-item">
                    <div class="task-meta-label">期限</div>
                    <div class="task-meta-value">${this.formatDate(task.deadline)}</div>
                </div>
                <div class="task-meta-item">
                    <div class="task-meta-label">ステータス</div>
                    <div class="task-meta-value">
                        <span class="status-badge status-${task.status}">${task.status}</span>
                    </div>
                </div>
                <div class="task-meta-item">
                    <div class="task-meta-label">優先度</div>
                    <div class="task-meta-value">
                        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                    </div>
                </div>
            </div>
            ${task.memo ? `<div class="task-memo">${task.memo}</div>` : ''}
        `;

        return element;
    }

    updateCalendarView() {
        this.updateCalendarTitle();
        const container = document.getElementById('calendar-container');

        switch (this.calendarView) {
            case 'month':
                container.innerHTML = this.renderMonthView();
                break;
            case 'week':
                container.innerHTML = this.renderWeekView();
                break;
            case 'day':
                container.innerHTML = this.renderDayView();
                break;
        }
    }

    renderMonthView() {
        const year = this.calendarDate.getFullYear();
        const month = this.calendarDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let html = '<div class="calendar-month">';
        
        // Header
        html += '<div class="calendar-header">';
        ['日', '月', '火', '水', '木', '金', '土'].forEach(day => {
            html += `<div class="calendar-header-cell">${day}</div>`;
        });
        html += '</div>';

        // Calendar days
        const currentDate = new Date(startDate);
        const endDate = new Date(lastDay);
        endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

        while (currentDate <= endDate) {
            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = this.isSameDate(currentDate, this.currentDate);
            const dateStr = this.formatDateForInput(currentDate);
            
            // Get tasks for this day
            const dayTasks = this.getTasksForDate(currentDate);
            
            html += `
                <div class="calendar-day ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''}" 
                     data-date="${dateStr}" onclick="taskManager.onCalendarDayClick('${dateStr}')">
                    <div class="calendar-day-number">${currentDate.getDate()}</div>
                    <div class="calendar-tasks">
                        ${dayTasks.map(task => `
                            <div class="calendar-task status-${task.status}" 
                                 onclick="event.stopPropagation(); taskManager.editTask(${task.id})" 
                                 title="${task.name} (${task.status})">
                                ${task.name.length > 15 ? task.name.substring(0, 15) + '...' : task.name}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            currentDate.setDate(currentDate.getDate() + 1);
        }

        html += '</div>';
        return html;
    }

    renderWeekView() {
        const startOfWeek = new Date(this.calendarDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        let html = '<div class="calendar-week">';
        html += '<div class="calendar-week-header">';
        html += '<div class="calendar-time-slot">時間</div>';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
            html += `<div class="calendar-time-slot">${dayNames[i]} ${date.getDate()}</div>`;
        }
        html += '</div>';

        // Time slots (simplified for this example)
        for (let hour = 8; hour < 18; hour++) {
            html += '<div class="calendar-time-row">';
            html += `<div class="calendar-time-slot">${hour}:00</div>`;
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(date.getDate() + i);
                const dayTasks = this.getTasksForDate(date);
                
                html += `<div class="calendar-time-slot">`;
                if (hour === 9 && dayTasks.length > 0) {
                    html += dayTasks.map(task => `
                        <div class="calendar-task status-${task.status}" 
                             onclick="taskManager.editTask(${task.id})" 
                             title="${task.name}">
                            ${task.name.substring(0, 10)}...
                        </div>
                    `).join('');
                }
                html += `</div>`;
            }
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    renderDayView() {
        const dayTasks = this.getTasksForDate(this.calendarDate);
        let html = '<div class="calendar-day-view">';
        
        html += `<h3>${this.formatDate(this.formatDateForInput(this.calendarDate))}のタスク</h3>`;
        
        if (dayTasks.length === 0) {
            html += '<p>この日にはタスクがありません。</p>';
        } else {
            html += '<div class="day-tasks">';
            dayTasks.forEach(task => {
                html += `
                    <div class="task-item" onclick="taskManager.editTask(${task.id})">
                        <h4>${task.name}</h4>
                        <p>担当者: ${task.assignee || '未設定'}</p>
                        <p>ステータス: <span class="status-badge status-${task.status}">${task.status}</span></p>
                        <p>優先度: <span class="priority-badge priority-${task.priority}">${task.priority}</span></p>
                        ${task.memo ? `<p class="task-memo">${task.memo}</p>` : ''}
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }

    getTasksForDate(date) {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        return this.tasks.filter(task => {
            if (!task.startDate || !task.deadline) return false;
            
            const taskStart = new Date(task.startDate);
            taskStart.setHours(0, 0, 0, 0);
            const taskEnd = new Date(task.deadline);
            taskEnd.setHours(23, 59, 59, 999);
            
            return targetDate >= taskStart && targetDate <= taskEnd;
        });
    }

    updateTimelineView() {
        const container = document.getElementById('timeline-container');
        
        // Get date range
        const dateRange = this.getTaskDateRange();
        if (!dateRange) {
            container.innerHTML = '<div style="padding: 2rem; text-align: center;"><p>タスクが見つかりません</p></div>';
            return;
        }

        const { startDate, endDate } = dateRange;
        const dates = this.getDateRange(startDate, endDate);
        
        let html = `
            <div class="timeline-header">
                <div class="timeline-tasks-header">タスク</div>
                <div class="timeline-dates-header">
                    ${dates.map(date => `
                        <div class="timeline-date-cell">
                            <div>${date.getMonth() + 1}/${date.getDate()}</div>
                            <div style="font-size: 10px; color: #666;">${date.getFullYear()}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="timeline-body">
                <div class="timeline-tasks">
                    ${this.renderTimelineTasks()}
                </div>
                <div class="timeline-bars">
                    ${this.renderTimelineBars(dates)}
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    renderTimelineTasks() {
        let html = '';
        const parentTasks = this.tasks.filter(task => !task.parentId);
        
        parentTasks.forEach(parentTask => {
            html += `
                <div class="timeline-task-row parent-task" data-task-id="${parentTask.id}">
                    <button class="timeline-expand-btn" onclick="taskManager.toggleTaskExpansion(${parentTask.id})">
                        <i class="fas fa-chevron-${this.showSubtasks ? 'down' : 'right'}"></i>
                    </button>
                    <span title="${parentTask.name}">${parentTask.name}</span>
                </div>
            `;
            
            if (this.showSubtasks) {
                const childTasks = this.tasks.filter(task => task.parentId === parentTask.id);
                childTasks.forEach(childTask => {
                    html += `
                        <div class="timeline-task-row child-task" data-task-id="${childTask.id}">
                            <span title="${childTask.name}">${childTask.name}</span>
                        </div>
                    `;
                });
            }
        });
        
        return html;
    }

    renderTimelineBars(dates) {
        let html = '';
        const parentTasks = this.tasks.filter(task => !task.parentId);
        
        parentTasks.forEach(parentTask => {
            html += `<div class="timeline-bar-row">${this.createTimelineBar(parentTask, dates)}</div>`;
            
            if (this.showSubtasks) {
                const childTasks = this.tasks.filter(task => task.parentId === parentTask.id);
                childTasks.forEach(childTask => {
                    html += `<div class="timeline-bar-row">${this.createTimelineBar(childTask, dates)}</div>`;
                });
            }
        });
        
        return html;
    }

    createTimelineBar(task, dates) {
        if (!task.startDate || !task.deadline) return '';
        
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.deadline);
        
        // Find the start and end positions
        let startIndex = -1;
        let endIndex = -1;
        
        for (let i = 0; i < dates.length; i++) {
            if (this.isSameDate(dates[i], taskStart) || (startIndex === -1 && dates[i] >= taskStart)) {
                startIndex = i;
            }
            if (this.isSameDate(dates[i], taskEnd) || dates[i] <= taskEnd) {
                endIndex = i;
            }
        }
        
        if (startIndex === -1) startIndex = 0;
        if (endIndex === -1) endIndex = dates.length - 1;
        if (endIndex < startIndex) endIndex = startIndex;
        
        const left = startIndex * 80; // 80px per day
        const width = Math.max(80, (endIndex - startIndex + 1) * 80);
        
        return `
            <div class="timeline-bar status-${task.status}" 
                 style="left: ${left}px; width: ${width}px;"
                 onclick="taskManager.editTask(${task.id})"
                 title="${task.name} (${this.formatDate(task.startDate)} - ${this.formatDate(task.deadline)})">
                <span style="font-size: 11px; font-weight: 500;">
                    ${task.name.length > 20 ? task.name.substring(0, 20) + '...' : task.name}
                </span>
            </div>
        `;
    }

    getTaskDateRange() {
        const tasksWithDates = this.tasks.filter(task => task.startDate && task.deadline);
        if (tasksWithDates.length === 0) return null;
        
        const startDates = tasksWithDates.map(task => new Date(task.startDate));
        const endDates = tasksWithDates.map(task => new Date(task.deadline));
        
        const minStart = new Date(Math.min(...startDates));
        const maxEnd = new Date(Math.max(...endDates));
        
        // Add some padding
        minStart.setDate(minStart.getDate() - 1);
        maxEnd.setDate(maxEnd.getDate() + 1);
        
        return {
            startDate: minStart,
            endDate: maxEnd
        };
    }

    getDateRange(startDate, endDate) {
        const dates = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return dates;
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.status === '完了').length;
        const activeTasks = this.tasks.filter(task => task.status === '進行中').length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('completed-tasks').textContent = completedTasks;
        document.getElementById('active-tasks').textContent = activeTasks;
        document.getElementById('completion-rate').textContent = `${completionRate}%`;
    }

    // Calendar navigation
    navigateCalendar(direction) {
        switch (this.calendarView) {
            case 'month':
                this.calendarDate.setMonth(this.calendarDate.getMonth() + direction);
                break;
            case 'week':
                this.calendarDate.setDate(this.calendarDate.getDate() + (direction * 7));
                break;
            case 'day':
                this.calendarDate.setDate(this.calendarDate.getDate() + direction);
                break;
        }
        this.updateCalendarView();
    }

    goToToday() {
        this.calendarDate = new Date(this.currentDate);
        this.updateCalendarView();
        this.showToast('今日の日付に移動しました', 'success');
    }

    switchCalendarView(view) {
        this.calendarView = view;
        
        // Update button states
        document.querySelectorAll('[data-calendar-view]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-calendar-view="${view}"]`).classList.add('active');
        
        this.updateCalendarView();
    }

    updateCalendarTitle() {
        const year = this.calendarDate.getFullYear();
        const month = this.calendarDate.getMonth() + 1;
        const date = this.calendarDate.getDate();
        
        let title;
        switch (this.calendarView) {
            case 'month':
                title = `${year}年${month}月`;
                break;
            case 'week':
                title = `${year}年${month}月 第${Math.ceil(date / 7)}週`;
                break;
            case 'day':
                title = `${year}年${month}月${date}日`;
                break;
        }
        
        document.getElementById('calendar-title').textContent = title;
    }

    // Event handlers
    onCalendarDayClick(dateStr) {
        this.openTaskModal(dateStr);
    }

    toggleTaskExpansion(taskId) {
        this.showSubtasks = !this.showSubtasks;
        this.updateTimelineView();
        this.showToast(`子タスク表示を${this.showSubtasks ? 'オン' : 'オフ'}にしました`, 'info');
    }

    // Task CRUD operations
    openTaskModal(defaultDate = null) {
        this.editingTaskId = null;
        document.getElementById('modal-title').textContent = '新規タスク作成';
        
        // Reset form
        document.getElementById('task-form').reset();
        
        if (defaultDate) {
            document.getElementById('task-start-date').value = defaultDate;
        }
        
        this.updateParentTaskDropdown();
        document.getElementById('task-modal').classList.add('active');
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        this.editingTaskId = taskId;
        document.getElementById('modal-title').textContent = 'タスク編集';
        
        // Populate form
        document.getElementById('task-name').value = task.name;
        document.getElementById('task-assignee').value = task.assignee || '';
        document.getElementById('task-assigner').value = task.assigner || '';
        document.getElementById('task-hours').value = task.estimatedHours || '';
        document.getElementById('task-start-date').value = task.startDate || '';
        document.getElementById('task-deadline').value = task.deadline || '';
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-memo').value = task.memo || '';
        document.getElementById('task-parent').value = task.parentId || '';
        
        this.updateParentTaskDropdown();
        document.getElementById('task-modal').classList.add('active');
    }

    deleteTask(taskId) {
        if (!confirm('このタスクを削除しますか？')) return;
        
        // Remove task and update child tasks
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.tasks.forEach(task => {
            if (task.parentId === taskId) {
                task.parentId = null;
            }
            if (task.childTasks) {
                task.childTasks = task.childTasks.filter(childId => childId !== taskId);
            }
        });
        
        this.updateView();
        this.updateStats();
        this.showToast('タスクが削除されました', 'success');
    }

    saveTask() {
        const taskData = {
            name: document.getElementById('task-name').value,
            assignee: document.getElementById('task-assignee').value,
            assigner: document.getElementById('task-assigner').value,
            estimatedHours: parseFloat(document.getElementById('task-hours').value) || 0,
            startDate: document.getElementById('task-start-date').value,
            deadline: document.getElementById('task-deadline').value,
            status: document.getElementById('task-status').value,
            priority: document.getElementById('task-priority').value,
            memo: document.getElementById('task-memo').value,
            parentId: parseInt(document.getElementById('task-parent').value) || null
        };
        
        if (!taskData.name.trim()) {
            this.showToast('タスク名を入力してください', 'error');
            return;
        }
        
        if (this.editingTaskId) {
            // Update existing task
            const taskIndex = this.tasks.findIndex(t => t.id === this.editingTaskId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...taskData };
                this.showToast('タスクが更新されました', 'success');
            }
        } else {
            // Create new task
            const newTask = {
                id: Math.max(...this.tasks.map(t => t.id), 0) + 1,
                ...taskData,
                childTasks: []
            };
            
            this.tasks.push(newTask);
            
            // Update parent task's childTasks array
            if (newTask.parentId) {
                const parentTask = this.tasks.find(t => t.id === newTask.parentId);
                if (parentTask) {
                    parentTask.childTasks.push(newTask.id);
                }
            }
            
            this.showToast('新しいタスクが作成されました', 'success');
        }
        
        this.closeTaskModal();
        this.updateView();
        this.updateStats();
    }

    closeTaskModal() {
        document.getElementById('task-modal').classList.remove('active');
        this.editingTaskId = null;
    }

    // Filtering and search
    getFilteredTasks() {
        let filtered = [...this.tasks];
        
        // Search filter
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(task => 
                task.name.toLowerCase().includes(searchTerm) ||
                (task.assignee && task.assignee.toLowerCase().includes(searchTerm)) ||
                (task.memo && task.memo.toLowerCase().includes(searchTerm))
            );
        }
        
        // Status filter
        const statusFilter = document.getElementById('status-filter').value;
        if (statusFilter) {
            filtered = filtered.filter(task => task.status === statusFilter);
        }
        
        // Priority filter
        const priorityFilter = document.getElementById('priority-filter').value;
        if (priorityFilter) {
            filtered = filtered.filter(task => task.priority === priorityFilter);
        }
        
        // Assignee filter
        const assigneeFilter = document.getElementById('assignee-filter').value;
        if (assigneeFilter) {
            filtered = filtered.filter(task => task.assignee === assigneeFilter);
        }
        
        return filtered;
    }

    filterTasks() {
        if (this.currentView === 'list') {
            this.updateListView();
        }
    }

    // Utility functions
    formatDate(dateStr) {
        if (!dateStr) return '未設定';
        const date = new Date(dateStr);
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    }

    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;
        
        document.getElementById('toast-container').appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
        
        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
    }
}

// Initialize the application
const taskManager = new TaskManager();