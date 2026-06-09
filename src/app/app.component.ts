import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { interval, Subscription } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TaskService } from './services/task.service';
import { GoalCardComponent } from './components/goal-card/goal-card.component';
import { ErrorDisplayComponent } from './components/error-display/error-display.component'
import { TaskListComponent } from './components/task-list/task-list.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { ManageUsersPageComponent } from './components/manage-users-page/manage-users-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, HttpClientModule, GoalCardComponent, ErrorDisplayComponent, TaskListComponent, LoginPageComponent, ManageUsersPageComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  taskService = inject(TaskService);
  showNewGoal = signal(false);
  newGoalTitle = '';
  intervalSubscription!: Subscription;

  ngOnInit(): void {
    this.taskService.checkStateHash();
    this.intervalSubscription = interval(10000).subscribe(()=>{this.checkSessionStatus();});
  }

  ngOnDestroy(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  checkSessionStatus(): void {
    if (this.taskService.logged_in()) {
      this.taskService.checkStateHash();
    }
  }

  totalTasks(): number {
    return this.taskService.sortedGoals().reduce((sum, g) => sum + g.tasks.length, 0);
  }

  totalCompleted(): number {
    return this.taskService.sortedGoals().reduce(
      (sum, g) => sum + g.tasks.filter(t => t.completed).length, 0
    );
  }

  submitGoal(): void {
    const title = this.newGoalTitle.trim();
    if (!title) return;
    this.taskService.addGoal(title);
    this.newGoalTitle = '';
    this.showNewGoal.set(false);
  }
}
