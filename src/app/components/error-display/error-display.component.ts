import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { env } from '../../environments/environment';


@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [],
  templateUrl: `./error-display.component.html`,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: [`./error-display.component.css`],
})
export class ErrorDisplayComponent {
  @Input() message: string = 'An unknown error occurred.';
  @Output() retry = new EventEmitter<void>();
  apiUrl = env.apiUrl;
}
