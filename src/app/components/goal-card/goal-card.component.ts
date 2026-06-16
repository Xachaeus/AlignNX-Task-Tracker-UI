import { Component, Input, Output, EventEmitter, signal, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Goal } from '../../models/task.model';
import { TaskItemComponent } from '../task-item/task-item.component';

@Component({
  selector: 'app-goal-card',
  standalone: true,
  imports: [FormsModule, TaskItemComponent],
  templateUrl: `./goal-card.component.html`,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './goal-card.component.css',
})
export class GoalCardComponent {
  @Input() goal!: Goal;
  @Input() progress!: number;
  @Input() isComplete!: boolean;
  @Output() toggleExpanded = new EventEmitter<void>();
  @Output() toggleTask = new EventEmitter<{task_id: string, parent_id: string}>();
  @Output() addTask = new EventEmitter<{ title: string; assignedTo: string, completeBy: string }>();

  showAddTask = signal(false);
  invalidDateEntered = signal(false);
  newTaskTitle = '';
  newTaskAssignee = '';
  newTaskCompleteBy = '';

  submitTask(): void {
    const title = this.newTaskTitle.trim();
    const assignedTo = this.newTaskAssignee.trim() || 'Unassigned';
    let completeBy = this.newTaskCompleteBy.trim();

    const mmddyyyy_Regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    const mmdd_Regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/;

    if (mmdd_Regex.test(completeBy) && !mmddyyyy_Regex.test(completeBy)) {
      completeBy = completeBy.concat("/" + String( new Date().getFullYear() ));
    }

    if (!title) return;
    if (!mmddyyyy_Regex.test(completeBy) && completeBy !== "") {
      this.invalidDateEntered.set(true);
      return;
    }
    this.invalidDateEntered.set(false);

    this.addTask.emit({ title, assignedTo, completeBy });
    this.newTaskTitle = '';
    this.newTaskAssignee = '';
    this.newTaskCompleteBy = '';
    this.showAddTask.set(false);
  }
}
