import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ServerService } from './services/server.service';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  startWith,
} from 'rxjs';
import { AppState } from './interface/app-state';
import { Server } from './interface/server';
import { CustomResponse } from './interface/custom-response';
import { DataState } from './enum/data-state.enum';
import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Status } from './enum/status.enum';
import { FormsModule, NgForm } from '@angular/forms';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe, JsonPipe, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  appState$!: Observable<AppState<CustomResponse>>; //The ! means: “I promise I will assign this before using it.”
  servers: Server[] = [];
  readonly DataState = DataState;
  readonly Status = Status;
  private filterSubject = new BehaviorSubject<string>('');
  private dataSubject = new BehaviorSubject<CustomResponse>(
    {} as CustomResponse
  );
  filterStatus$ = this.filterSubject.asObservable();
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();

  constructor(
    private serverService: ServerService,
    private notifier: NotificationService
  ) {}

  ngOnInit(): void {
    this.appState$ = this.serverService.getServers$().pipe(
      map((response: CustomResponse) => {
        console.log('Response received:', response);
        console.log('Servers:', response.data?.servers);

        // Save loaded data so UI can use it
        this.dataSubject.next(response);
        this.notifier.onDefault(response.message);

        return {
          dataState: DataState.LOADED_STATE,
          appData: response,
        };
      }),
      startWith({ dataState: DataState.LOADING_STATE }),
      catchError((error: string) => {
        console.error('Error loading servers:', error);
        this.notifier.onError(error);
        return of({
          dataState: DataState.ERROR_STATE,
          error: error,
        } as AppState<CustomResponse>);
      })
    );
  }

  printReport(): void {
    const tableSelect = document.getElementById('servers');

    if (!tableSelect) {
      this.notifier.onError('Table not found');
      return;
    }

    this.notifier.onDefault('Report downloaded');
    const dataType = 'application/vnd.ms-excel.sheet.macroEnabled.12';
    const tableHtml = tableSelect.outerHTML.replace(/ /g, '%20');
    const downloadLink = document.createElement('a');

    document.body.appendChild(downloadLink);
    downloadLink.href = 'data:' + dataType + ', ' + tableHtml;
    downloadLink.download = 'server-report.xls';
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  filterServers(status: Status): void {
    const currentData = this.dataSubject.value;
    if (!currentData) return;

    this.appState$ = this.serverService
      .filterServers$(status, currentData)
      .pipe(
        map((response) => {
          this.notifier.onDefault(response.message);
          return { dataState: DataState.LOADED_STATE, appData: response };
        }),
        startWith({
          dataState: DataState.LOADED_STATE,
          appData: currentData,
        }),
        catchError((error: string) => {
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
  }

  pingServer(ipAddress: string): void {
    this.filterSubject.next(ipAddress);
    this.appState$ = this.serverService.pingServer$(ipAddress).pipe(
      map((response) => {
        const currentData = this.dataSubject.value;
        if (currentData?.data?.servers && response.data.server) {
          const index = currentData.data.servers.findIndex(
            (server) => server.id === response.data.server!.id
          );
          if (index !== -1) {
            currentData.data.servers[index] = response.data.server;
          }
        }
        this.notifier.onDefault(response.message);
        this.filterSubject.next('');
        return {
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value!,
        };
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value!,
      }),
      catchError((error: string) => {
        this.filterSubject.next('');
        this.notifier.onError(error);
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }

  deleteServer(server: Server): void {
    this.appState$ = this.serverService.deleteServer$(server.id).pipe(
      map((response) => {
        const currentData = this.dataSubject.value;
        this.dataSubject.next({
          ...response,
          data: {
            servers:
              currentData?.data?.servers?.filter((s) => s.id !== server.id) ||
              [],
          },
        });
        this.notifier.onDefault(response.message);
        return {
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value!,
        };
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value!,
      }),
      catchError((error: string) => {
        this.notifier.onError(error);
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }

  saveServer(serverForm: NgForm): void {
    this.isLoading.next(true);

    // Get form value
    const server: Server = serverForm.value as Server;

    this.appState$ = this.serverService.saveServer$(server).pipe(
      map((response) => {
        const currentData = this.dataSubject.value;
        if (response.data.server) {
          this.dataSubject.next({
            ...response,
            data: {
              servers: [
                response.data.server,
                ...(currentData?.data?.servers || []),
              ],
            },
          });
        }
        this.notifier.onDefault(response.message);
        document.getElementById('closeModal')?.click();
        this.isLoading.next(false);
        serverForm.resetForm({ status: this.Status.SERVER_DOWN });
        return {
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value!,
        };
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value!,
      }),
      catchError((error: string) => {
        this.isLoading.next(false);
        this.notifier.onError(error);
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }
}
