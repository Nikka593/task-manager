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
        this.taskToDelete = null;
        
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

        // Task buttons
        document.getElementById('new-task-btn').addEventListener('click', () => {
            this.openTaskModal();
        });

        document.getElementById('bulk-parent-btn').addEventListener('click', () => {
            this.openBulkParentModal();
        });

        document.getElementById('bulk-child-btn').addEventListener('click', () => {
            this.openBulkChildModal();
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterTasks();
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

        // Regular task modal controls
        document.getElementById('modal-close').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('modal-cancel').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('modal-save').addEventListener('click', () => this.saveTask());
        document.getElementById('task-modal').addEventListener('click', (e) => {
            if (e.target.id === 'task-modal') this.closeTaskModal();
        });

        // Bulk parent modal controls
        document.getElementById('bulk-parent-close').addEventListener('click', () => this.closeBulkParentModal());
        document.getElementById('bulk-parent-cancel').addEventListener('click', () => this.closeBulkParentModal());
        document.getElementById('bulk-parent-save').addEventListener('click', () => this.saveBulkParentTasks());
        document.getElementById('bulk-parent-modal').addEventListener('click', (e) => {
            if (e.target.id === 'bulk-parent-modal') this.closeBulkParentModal();
        });

        // Bulk child modal controls
        document.getElementById('bulk-child-close').addEventListener('click', () => this.closeBulkChildModal());
        document.getElementById('bulk-child-cancel').addEventListener('click', () => this.closeBulkChildModal());
        document.getElementById('bulk-child-save').addEventListener('click', () => this.saveBulkChildTasks());
        document.getElementById('bulk-child-modal').addEventListener('click', (e) => {
            if (e.target.id === 'bulk-child-modal') this.closeBulkChildModal();
        });

        // Delete confirmation modal controls
        document.getElementById('delete-modal-close').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('delete-cancel').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('delete-confirm').addEventListener('click', () => this.confirmDelete());
        document.getElementById('delete-modal').addEventListener('click', (e) => {
            if (e.target.id === 'delete-modal') this.closeDeleteModal();
        });

        // Bulk registration preview updates
        document.getElementById('bulk-parent-names').addEventListener('input', () => this.updateBulkParentPreview());
        document.getElementById('bulk-child-names').addEventListener('input', () => this.updateBulkChildPreview());
    }

    populateDropdowns() {
        // Populate user dropdowns
        const assigneeSelects = [
            document.getElementById('assignee-filter'),
            document.getElementById('task-assignee'),
            document.getElementById('task-assigner'),
            document.getElementById('bulk-parent-assignee'),
            document.getElementById('bulk-parent-assigner'),
            document.getElementById('bulk-child-assignee'),
            document.getElementById('bulk-child-assigner')
        ];

        assigneeSelects.forEach(select => {
            if (select) {
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
        const parentSelects = [
            document.getElementById('task-parent'),
            document.getElementById('bulk-child-parent')
        ];

        parentSelects.forEach(parentSelect => {
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
            stats: '統計ダッシュボード'
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
        }
    }

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

    // Bulk Parent Tasks Modal Functions
    openBulkParentModal() {
        document.getElementById('bulk-parent-modal').classList.add('active');
        this.resetBulkParentForm();
        this.updateBulkParentPreview();
    }

    closeBulkParentModal() {
        document.getElementById('bulk-parent-modal').classList.remove('active');
    }

    resetBulkParentForm() {
        document.getElementById('bulk-parent-names').value = '';
        document.getElementById('bulk-parent-assignee').value = '';
        document.getElementById('bulk-parent-assigner').value = '';
        document.getElementById('bulk-parent-status').value = '未開始';
        document.getElementById('bulk-parent-priority').value = '中';
        document.getElementById('bulk-parent-start-date').value = '';
        document.getElementById('bulk-parent-deadline').value = '';
        document.getElementById('bulk-parent-memo').value = '';
    }

    updateBulkParentPreview() {
        const namesText = document.getElementById('bulk-parent-names').value;
        const names = namesText.split('\n').map(name => name.trim()).filter(name => name.length > 0);
        const previewContainer = document.getElementById('bulk-parent-preview');
        
        if (names.length === 0) {
            previewContainer.innerHTML = '<h5>プレビュー</h5><p class="bulk-preview-empty">タスク名を入力してください</p>';
            return;
        }

        if (names.length > 10) {
            previewContainer.innerHTML = '<h5>プレビュー</h5><p class="bulk-preview-empty">最大10個のタスクまで作成できます</p>';
            return;
        }

        const listHtml = names.map(name => `<li class="bulk-preview-item">${name}</li>`).join('');
        previewContainer.innerHTML = `
            <h5>プレビュー（${names.length}個のタスク）</h5>
            <ul class="bulk-preview-list">${listHtml}</ul>
        `;
    }

    saveBulkParentTasks() {
        const namesText = document.getElementById('bulk-parent-names').value;
        const names = namesText.split('\n').map(name => name.trim()).filter(name => name.length > 0);
        
        if (names.length === 0) {
            this.showToast('タスク名を入力してください', 'error');
            return;
        }

        if (names.length > 10) {
            this.showToast('最大10個のタスクまで作成できます', 'error');
            return;
        }

        const commonData = {
            assignee: document.getElementById('bulk-parent-assignee').value,
            assigner: document.getElementById('bulk-parent-assigner').value,
            status: document.getElementById('bulk-parent-status').value,
            priority: document.getElementById('bulk-parent-priority').value,
            startDate: document.getElementById('bulk-parent-start-date').value,
            deadline: document.getElementById('bulk-parent-deadline').value,
            memo: document.getElementById('bulk-parent-memo').value
        };

        const createdTasks = [];
        let nextId = Math.max(...this.tasks.map(t => t.id), 0) + 1;

        names.forEach(name => {
            const newTask = {
                id: nextId++,
                name: name,
                estimatedHours: 0,
                parentId: null,
                childTasks: [],
                ...commonData
            };
            
            this.tasks.push(newTask);
            createdTasks.push(newTask);
        });

        this.closeBulkParentModal();
        this.updateParentTaskDropdown();
        this.updateView();
        this.updateStats();
        this.showToast(`${createdTasks.length}個の親タスクを作成しました`, 'success');
    }

    // Bulk Child Tasks Modal Functions
    openBulkChildModal() {
        document.getElementById('bulk-child-modal').classList.add('active');
        this.updateParentTaskDropdown();
        this.resetBulkChildForm();
        this.updateBulkChildPreview();
    }

    closeBulkChildModal() {
        document.getElementById('bulk-child-modal').classList.remove('active');
    }

    resetBulkChildForm() {
        document.getElementById('bulk-child-parent').value = '';
        document.getElementById('bulk-child-names').value = '';
        document.getElementById('bulk-child-assignee').value = '';
        document.getElementById('bulk-child-assigner').value = '';
        document.getElementById('bulk-child-status').value = '未開始';
        document.getElementById('bulk-child-priority').value = '中';
        document.getElementById('bulk-child-start-date').value = '';
        document.getElementById('bulk-child-deadline').value = '';
        document.getElementById('bulk-child-memo').value = '';
    }

    updateBulkChildPreview() {
        const namesText = document.getElementById('bulk-child-names').value;
        const names = namesText.split('\n').map(name => name.trim()).filter(name => name.length > 0);
        const previewContainer = document.getElementById('bulk-child-preview');
        
        if (names.length === 0) {
            previewContainer.innerHTML = '<h5>プレビュー</h5><p class="bulk-preview-empty">タスク名を入力してください</p>';
            return;
        }

        if (names.length > 20) {
            previewContainer.innerHTML = '<h5>プレビュー</h5><p class="bulk-preview-empty">最大20個のタスクまで作成できます</p>';
            return;
        }

        const listHtml = names.map(name => `<li class="bulk-preview-item">${name}</li>`).join('');
        previewContainer.innerHTML = `
            <h5>プレビュー（${names.length}個のタスク）</h5>
            <ul class="bulk-preview-list">${listHtml}</ul>
        `;
    }

    saveBulkChildTasks() {
        const parentId = parseInt(document.getElementById('bulk-child-parent').value);
        const namesText = document.getElementById('bulk-child-names').value;
        const names = namesText.split('\n').map(name => name.trim()).filter(name => name.length > 0);
        
        if (!parentId) {
            this.showToast('親タスクを選択してください', 'error');
            return;
        }

        if (names.length === 0) {
            this.showToast('タスク名を入力してください', 'error');
            return;
        }

        if (names.length > 20) {
            this.showToast('最大20個のタスクまで作成できます', 'error');
            return;
        }

        const parentTask = this.tasks.find(t => t.id === parentId);
        if (!parentTask) {
            this.showToast('選択された親タスクが見つかりません', 'error');
            return;
        }

        const commonData = {
            assignee: document.getElementById('bulk-child-assignee').value,
            assigner: document.getElementById('bulk-child-assigner').value,
            status: document.getElementById('bulk-child-status').value,
            priority: document.getElementById('bulk-child-priority').value,
            startDate: document.getElementById('bulk-child-start-date').value,
            deadline: document.getElementById('bulk-child-deadline').value,
            memo: document.getElementById('bulk-child-memo').value
        };

        const createdTasks = [];
        let nextId = Math.max(...this.tasks.map(t => t.id), 0) + 1;

        names.forEach(name => {
            const newTask = {
                id: nextId++,
                name: name,
                estimatedHours: 0,
                parentId: parentId,
                childTasks: [],
                ...commonData
            };
            
            this.tasks.push(newTask);
            parentTask.childTasks.push(newTask.id);
            createdTasks.push(newTask);
        });

        this.closeBulkChildModal();
        this.updateView();
        this.updateStats();
        this.showToast(`${createdTasks.length}個の子タスクを「${parentTask.name}」に作成しました`, 'success');
    }

    // Enhanced Delete Functions
    deleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        this.taskToDelete = taskId;
        const hasChildren = task.childTasks && task.childTasks.length > 0;
        
        document.getElementById('delete-message').textContent = 
            `「${task.name}」を削除しますか？${hasChildren ? '（子タスクが存在します）' : ''}`;
        
        const childOptions = document.getElementById('delete-child-options');
        if (hasChildren) {
            childOptions.classList.remove('hidden');
            document.getElementById('delete-with-children').checked = false;
        } else {
            childOptions.classList.add('hidden');
        }

        document.getElementById('delete-modal').classList.add('active');
    }

    closeDeleteModal() {
        document.getElementById('delete-modal').classList.remove('active');
        this.taskToDelete = null;
    }

    confirmDelete() {
        if (!this.taskToDelete) return;

        const task = this.tasks.find(t => t.id === this.taskToDelete);
        if (!task) return;

        const deleteWithChildren = document.getElementById('delete-with-children').checked;
        let deletedCount = 1;

        // Handle child tasks
        if (task.childTasks && task.childTasks.length > 0) {
            if (deleteWithChildren) {
                // Delete child tasks
                task.childTasks.forEach(childId => {
                    this.tasks = this.tasks.filter(t => t.id !== childId);
                    deletedCount++;
                });
            } else {
                // Orphan child tasks (remove parentId)
                task.childTasks.forEach(childId => {
                    const childTask = this.tasks.find(t => t.id === childId);
                    if (childTask) {
                        childTask.parentId = null;
                    }
                });
            }
        }

        // Remove task from parent's childTasks array if it has a parent
        if (task.parentId) {
            const parentTask = this.tasks.find(t => t.id === task.parentId);
            if (parentTask && parentTask.childTasks) {
                parentTask.childTasks = parentTask.childTasks.filter(childId => childId !== this.taskToDelete);
            }
        }

        // Remove the task itself
        this.tasks = this.tasks.filter(t => t.id !== this.taskToDelete);

        this.closeDeleteModal();
        this.updateParentTaskDropdown();
        this.updateView();
        this.updateStats();
        
        const message = deletedCount > 1 ? 
            `${deletedCount}個のタスクが削除されました` : 
            'タスクが削除されました';
        this.showToast(message, 'success');
    }

    // Calendar and Timeline functionality (keeping existing methods)
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
                // Handle parent change
                const oldTask = this.tasks[taskIndex];
                if (oldTask.parentId !== taskData.parentId) {
                    // Remove from old parent
                    if (oldTask.parentId) {
                        const oldParent = this.tasks.find(t => t.id === oldTask.parentId);
                        if (oldParent && oldParent.childTasks) {
                            oldParent.childTasks = oldParent.childTasks.filter(id => id !== this.editingTaskId);
                        }
                    }
                    // Add to new parent
                    if (taskData.parentId) {
                        const newParent = this.tasks.find(t => t.id === taskData.parentId);
                        if (newParent) {
                            if (!newParent.childTasks) newParent.childTasks = [];
                            newParent.childTasks.push(this.editingTaskId);
                        }
                    }
                }
                
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
                    if (!parentTask.childTasks) parentTask.childTasks = [];
                    parentTask.childTasks.push(newTask.id);
                }
            }
            
            this.showToast('新しいタスクが作成されました', 'success');
        }
        
        this.closeTaskModal();
        this.updateParentTaskDropdown();
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