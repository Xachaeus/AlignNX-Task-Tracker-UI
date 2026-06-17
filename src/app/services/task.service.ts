import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Goal, User } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private api = inject(ApiService);

  // ── Auth: swap this signal's value for real session/auth integration ──
  currentUser = signal<User>({ id: 'u1', name: 'Sign In', role: "user" });

  // ── Raw goals from the database ──
  goals = signal<Goal[]>([]);

  // Valid login credentials state check
  logged_in = signal<boolean>(false);
  prev_logged_in = signal<boolean>(false);

  // State for checking for changes to the goal/task database
  state_hash = signal<string>("");

  // ── UI state ──
  page = signal<string>("login");
  loading = signal(false);
  error = signal<string | null>(null);
  filterMyTasks = signal(false);

  sortedTasks = computed(() => {
    const raw = this.goals();
    const me = this.currentUser().name;

    return [...raw]
      .flatMap(goal => {
        const tasks = goal.tasks.filter(t => t.assignedTo === me);
        const sortedTasks = [
          ...tasks.filter(t => !t.completed),
          ...tasks.filter(t => t.completed)
        ];
        return [...sortedTasks]
      })
  })

  // ── Sorted + filtered view of goals ──
  sortedGoals = computed(() => {
    const raw = this.goals();
    const myOnly = this.filterMyTasks();
    const me = this.currentUser().name;

    return [...raw]
      .map(goal => {
        // Apply per-task user filter if enabled
        const tasks = myOnly
          ? goal.tasks.filter(t => t.assignedTo === me)
          : goal.tasks;

        // Sort tasks: incomplete first, completed last
        const sortedTasks = [
          ...tasks.filter(t => !t.completed),
          ...tasks.filter(t => t.completed),
        ];

        return { ...goal, tasks: sortedTasks };
      })
      // After filtering tasks, drop goals that have no visible tasks
      // (only when filter is active — show all goals when filter is off)
      .filter(goal => !myOnly || goal.tasks.length > 0)
      // Sort goals: incomplete first, complete last
      .sort((a, b) => {
        const aComplete = this.isGoalComplete(a);
        const bComplete = this.isGoalComplete(b);
        if (aComplete === bComplete) return 0;
        return aComplete ? 1 : -1;
      });
  });


  // Load session information from the server
  loadSession(): void {
    this.api.getSession().subscribe({
      next: info => {
        this.setCurrentUser(info.name, info.role);
      },
      error: err => {
        this.error.set(err?.message ?? 'Failed to load session.');
      }
    })
  }

  // End session, AKA logout
  endSession(): void {
    this.api.endSession().subscribe();
    this.setCurrentUser("Sign In", 'user');
    this.logged_in.set(false);
    this.prev_logged_in.set(false);
    this.state_hash.set("");
    this.page.set("login");
  }

  // Load the hash of all goal data to see if any updates were made
  checkStateHash(): void {
    this.api.getUpdated().subscribe({
      next: hash => {
        this.logged_in.set(true);
        if (this.page() === "login") {this.page.set('tasks');}
        this.prev_logged_in.set(true);
        if (hash !== this.state_hash()) {
          this.loadGoals();
        }
        this.state_hash.set(hash);
      },
      error: err => {
        // In this case, error is most likely due to invalid credentials, so treat this as proof of server-initiated logout
        this.error.set(err?.message ?? 'Failed to load state hash.');
        this.state_hash.set("");
        this.logged_in.set(false);
        this.page.set("login");
      }
    })
  }

  // ── Load all goals from the API ──
  loadGoals(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getGoals().subscribe({
      next: goals => {
        // Preserve expanded state across reloads
        const prevExpanded = new Map(this.goals().map(g => [g.id, g.expanded]));
        this.goals.set(
          goals.map(g => ({
            ...g,
            tasks: [...g.tasks].map(t => {return {...t, parent: g};}),
            expanded: prevExpanded.get(g.id) ?? false
          }))
        );
        this.loading.set(false);
        this.logged_in.set(true);
        this.prev_logged_in.set(true);
        this.loadSession();
      },
      error: err => {
        this.error.set(err?.message ?? 'Failed to load goals.');
        this.loading.set(false);
        this.logged_in.set(false);
        this.page.set("login");
      },
    });
  }

  toggleTask(data:{task_id: string, parent_id: string}): void {

    const goalId = data.parent_id;
    const taskId = data.task_id;

    // Optimistic update
    const prev = this.goals();
    this.goals.update(goals =>
      goals.map(g =>
        g.id !== goalId ? g : {
          ...g,
          tasks: g.tasks.map(t =>
            t.id !== taskId ? t : { ...t, completed: !t.completed }
          ),
        }
      )
    );

    const goal = this.goals().find(g => g.id === goalId);
    const task = goal?.tasks.find(t => t.id === taskId);
    if (!task) return;

    this.api.toggleTask(goalId, taskId, task.completed).subscribe({
      error: () => {
        // Roll back on failure
        this.goals.set(prev);
        this.error.set('Failed to update task. Please try again.');
        this.logged_in.set(false);
        this.page.set("login");
      },
    });
    this.checkStateHash();
  }

  toggleGoalExpanded(goalId: string): void {
    this.goals.update(goals =>
      goals.map(g => g.id !== goalId ? g : { ...g, expanded: !g.expanded })
    );
  }

  addGoal(title: string): void {
    this.api.createGoal(title).subscribe({
      next: newGoal => {
        this.goals.update(goals => [...goals, { ...newGoal, expanded: true }]);
      },
      error: () => {this.error.set('Failed to create goal.'); this.logged_in.set(false); this.page.set("login");},
    });
    this.checkStateHash();
  }

  addTask(goalId: string, title: string, assignedTo: string, completeBy: string): void {
    this.api.createTask(goalId, title, assignedTo, completeBy).subscribe({
      next: newTask => {
        this.goals.update(goals =>
          goals.map(g =>
            g.id !== goalId ? g : { ...g, tasks: [...g.tasks, newTask] }
          )
        );
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Failed to create task.');
        if (err.status == 401) {
          this.logged_in.set(false);
          this.page.set("login");
        }
      },
    });
    this.checkStateHash();
  }

  deleteTask(goalId: string, taskId: string): void {
    this.api.deleteTask(goalId, taskId).subscribe();
    setTimeout(() => {this.loadGoals()}, 300);
  }

  getProgress(goal: Goal): number {
    if (!goal.tasks.length) return 0;
    return Math.round((goal.tasks.filter(t => t.completed).length / goal.tasks.length) * 100);
  }

  isGoalComplete(goal: Goal): boolean {
    return goal.tasks.length > 0 && goal.tasks.every(t => t.completed);
  }

  setCurrentUser(user: string, role: string): void {
    this.currentUser.set({id: 'u0', name: user, role: role});
  }
}
