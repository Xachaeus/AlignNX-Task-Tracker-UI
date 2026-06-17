import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Goal, Task, UserAuth, UserMeta } from '../models/task.model';

import { env } from '../environments/environment';

// Change this to match your backend URL
const API_BASE = env.apiUrl;

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  checkUsername(username: string, password: string): Observable<UserAuth> {
    return this.http.post<UserAuth>(`${API_BASE}/login`, {username: username, password: password}, {withCredentials: true})
  }

  getSession(): Observable<UserAuth> {
    return this.http.get<UserAuth>(`${API_BASE}/session`, {withCredentials: true});
  }

  endSession(): Observable<void> {
    return this.http.post<void>(`${API_BASE}/logout`, {}, {withCredentials: true});
  }

  getUpdated(): Observable<string> {
    return this.http.get<string>(`${API_BASE}/updated`, {withCredentials: true});
  }

  getGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${API_BASE}/goals`, {withCredentials: true});
  }

  toggleTask(goalId: string, taskId: string, completed: boolean): Observable<Task> {
    return this.http.patch<Task>(`${API_BASE}/goals/${goalId}/tasks/${taskId}`, { completed }, {withCredentials: true});
  }

  createGoal(title: string): Observable<Goal> {
    return this.http.post<Goal>(`${API_BASE}/goals`, { title }, {withCredentials: true});
  }

  createTask(goalId: string, title: string, assignedTo: string, completeBy: string): Observable<Task> {
    return this.http.post<Task>(`${API_BASE}/goals/${goalId}/tasks`, { title, assignedTo, completeBy }, {withCredentials: true});
  }

  deleteTask(goalId: string, taskId: string): Observable<string> {
    return this.http.delete<string>(`${API_BASE}/goals/${goalId}/tasks/${taskId}`, {withCredentials: true})
  }

  getUsers(): Observable<UserMeta[]> {
    return this.http.get<UserMeta[]>(`${API_BASE}/users`, {withCredentials: true});
  }

  updateUser(userId: string, username: string, password_hash: string, name: string, role: string): Observable<string> {
    return this.http.patch<string>(`${API_BASE}/users`, {id: userId, username: username, password_hash: password_hash, name: name, role: role}, {withCredentials: true});
  }

  addUser(username: string, password_hash: string, name: string, role: string): Observable<string> {
    return this.http.post<string>(`${API_BASE}/users`, {username: username, password_hash: password_hash, name: name, role: role}, {withCredentials: true})
  }

  deleteUser(userId: string): Observable<string> {
    return this.http.delete<string>(`${API_BASE}/users/${userId}`, {withCredentials: true})
  }
}
