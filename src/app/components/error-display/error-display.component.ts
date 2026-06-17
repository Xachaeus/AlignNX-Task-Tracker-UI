import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { env } from '../../environments/environment';


@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [],
  template: `
    <div class="error-shell">
      <div class="error-card">
        <div class="error-icon">⚠</div>
        <h2 class="error-title">Could not load data</h2>
        <p class="error-message">{{ message }}</p>
        <div class="error-hints">
          <p class="hints-heading">Things to check:</p>
          <ul>
            <li>The API server is running on <code>{{ apiUrl }}</code></li>
            <li>PostgreSQL is running and accepting connections</li>
            <li>Your <code>proxy.conf.json</code> is pointed at the right port</li>
            <li>No firewall is blocking the connection</li>
          </ul>
        </div>
        <button class="retry-btn" (click)="retry.emit()">↺ Retry</button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .error-shell {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 80px 24px;
    }

    .error-card {
      background: var(--card);
      border: 1px solid rgba(224, 90, 90, 0.25);
      border-radius: 14px;
      padding: 40px 36px;
      max-width: 480px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .error-icon {
      font-size: 28px;
      color: #e05a5a;
      line-height: 1;
    }

    .error-title {
      font-family: var(--font-display);
      font-size: 22px;
      color: var(--text);
      margin: 0;
      letter-spacing: -0.02em;
    }

    .error-message {
      font-size: 13px;
      color: #e05a5a;
      background: rgba(224, 90, 90, 0.08);
      border: 1px solid rgba(224, 90, 90, 0.2);
      border-radius: 6px;
      padding: 10px 14px;
      margin: 0;
      width: 100%;
      font-family: var(--font-body);
      word-break: break-word;
      line-height: 1.6;
    }

    .error-hints {
      width: 100%;
    }

    .hints-heading {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin: 0 0 10px;
      font-family: var(--font-body);
    }

    ul {
      margin: 0;
      padding-left: 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    li {
      font-size: 13px;
      color: var(--text-muted);
      font-family: var(--font-body);
      line-height: 1.5;
    }

    code {
      font-family: var(--font-body);
      font-size: 12px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 1px 6px;
      color: var(--accent);
    }

    .retry-btn {
      margin-top: 4px;
      padding: 9px 20px;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: var(--font-body);
      transition: opacity 0.2s;
    }
    .retry-btn:hover { opacity: 0.85; }
  `],
})
export class ErrorDisplayComponent {
  @Input() message: string = 'An unknown error occurred.';
  @Output() retry = new EventEmitter<void>();
  apiUrl = env.apiUrl;
}
