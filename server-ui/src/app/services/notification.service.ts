import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  onDefault(message: string): void {
    this.toastr.show(message);
  }

  onSuccess(message: string): void {
    this.toastr.success(message);
  }

  onInfo(message: string): void {
    this.toastr.info(message);
  }

  onWarning(message: string): void {
    this.toastr.warning(message);
  }

  onError(message: string): void {
    this.toastr.error(message);
  }
}
