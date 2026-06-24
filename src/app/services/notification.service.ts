import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { IndividualConfig, ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  info(arg0: string, arg1: string) {
    throw new Error('Method not implemented.');
  }
  private readonly successConfig: Partial<IndividualConfig> = {
    timeOut: 3000,
    progressBar: true,
    closeButton: false,
  };

  private readonly errorConfig: Partial<IndividualConfig> = {
    timeOut: 7000,
    progressBar: true,
    closeButton: true,
    tapToDismiss: false,
  };

  private readonly warningConfig: Partial<IndividualConfig> = {
    timeOut: 5000,
    progressBar: true,
    closeButton: true,
  };

  constructor(private readonly toastr: ToastrService) {}

  success(message: string, title = 'Sucesso'): void {
    this.toastr.success(message, title, this.successConfig);
  }

  error(message: string, title = 'Erro'): void {
    this.toastr.error(message, title, this.errorConfig);
  }

  warning(message: string, title = 'Atenção'): void {
    this.toastr.warning(message, title, this.warningConfig);
  }

  getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return error.error.message || 'Erro de rede. Verifique sua conexão.';
    }

    const backendError = error.error;
    if (backendError) {
      if (typeof backendError === 'string') {
        return backendError;
      }

      if (typeof backendError.message === 'string') {
        return backendError.message;
      }

      if (Array.isArray(backendError.errors) && backendError.errors.length > 0) {
        return String(backendError.errors[0]);
      }

      if (typeof backendError.detail === 'string') {
        return backendError.detail;
      }
    }

    if (error.message) {
      return error.message;
    }

    return 'Ocorreu um erro ao processar sua solicitação.';
  }
}
