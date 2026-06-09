import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal, SimpleChanges } from '@angular/core';
import { TaskItemComponent } from '../task-item/task-item.component';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [TaskItemComponent],
  templateUrl: './task-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent {
  @Input() tasks!: Task[];
  @Output() toggleTask = new EventEmitter<{task_id: string, parent_id: string}>();

  expanded = signal<boolean>(true);
  isComplete = signal<boolean>(false);
  progress = signal<number>(0.0);


  TaskUpdateCallback(event: {task_id: string, parent_id: string}, taskChangedState: boolean) {
    this.toggleTask.emit(event);
    if (this.tasks.length === 0) {this.progress.set(0.0);}
    else {this.progress.set(Math.round(((this.tasks.filter(t => t.completed).length + (taskChangedState ? -1 : 1)) / this.tasks.length) * 100));}
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tasks']) {
      if (this.tasks.length === 0) {this.progress.set(0.0);}
      else {this.progress.set(Math.round((this.tasks.filter(t => t.completed).length / this.tasks.length) * 100));}
    }
  }
}
