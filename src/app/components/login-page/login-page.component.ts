import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { TaskService } from '../../services/task.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent  {

  apiService = inject(ApiService);
  taskService = inject(TaskService);
  username = '';
  password = '';

  message = signal<string>(this.taskService.prev_logged_in() ? 'Session timed out.\nPlease re-enter your credentials.' : 'Please enter your credentials.');
  loading = signal<boolean>(false);

  check_credentials() {
    if (this.loading()) {return;}
    this.loading.set(true);
    this.message.set("Checking credentials...");
    const backend_message = setTimeout(() => {this.message.set("Waiting for backend to wake up...");}, 2000);
    this.apiService.checkUsername(this.username, this.password).subscribe({
      next: ua => {
        // Credentials successfully authenticated
        clearTimeout(backend_message);
        this.message.set(ua.message);
        this.loading.set(false);
        setTimeout(() => {
          this.taskService.setCurrentUser(ua.name, ua.role);
          this.taskService.page.set("tasks");
          this.taskService.checkStateHash();
        }, 250);
      },
      error: err => {
        if (err.status == 401){
          clearTimeout(backend_message);
          this.message.set("Invalid Username or Password.");
          this.loading.set(false);
        }
        else {
          clearTimeout(backend_message);
          this.message.set("Could not connect to backend, please try again later.");
          this.loading.set(false);
        }
      }
    });
  }
}
