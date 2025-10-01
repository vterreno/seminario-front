/**
 * Utilidad para manejar y categorizar errores de la aplicación
 */

export interface ErrorInfo {
  type: 'conflict' | 'validation' | 'network' | 'permission' | 'not-found' | 'server' | 'unknown';
  title: string;
  message: string;
  icon: string;
}

export class ErrorHandler {
  /**
   * Analiza un error y devuelve información categorizada para mostrar al usuario
   */
  static categorizeError(error: any, context?: string): ErrorInfo {
    const errorMessage = error.message || error.response?.data?.message || 'Error desconocido';
    const statusCode = error.response?.status;

    // Errores de conflicto (409) o duplicados
    if (statusCode === 409 || 
        errorMessage.includes('ya existe') || 
        errorMessage.includes('No se puede crear') || 
        errorMessage.includes('No se puede actualizar') ||
        errorMessage.includes('duplicate') ||
        errorMessage.includes('unique')) {
      return {
        type: 'conflict',
        title: 'Conflicto de datos',
        message: errorMessage,
        icon: '⚠️'
      };
    }

    // Errores de validación (400)
    if (statusCode === 400 ||
        errorMessage.includes('validación') ||
        errorMessage.includes('requerido') ||
        errorMessage.includes('formato') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('must be') ||
        errorMessage.includes('should be')) {
      return {
        type: 'validation',
        title: 'Error de validación',
        message: errorMessage,
        icon: '📝'
      };
    }

    // Errores de permisos (403)
    if (statusCode === 403 ||
        errorMessage.includes('debe pertenecer a una empresa') ||
        errorMessage.includes('permisos') ||
        errorMessage.includes('forbidden') ||
        errorMessage.includes('unauthorized')) {
      return {
        type: 'permission',
        title: 'Sin permisos',
        message: errorMessage,
        icon: '🔒'
      };
    }

    // Errores de recurso no encontrado (404)
    if (statusCode === 404 ||
        errorMessage.includes('no encontr') ||
        errorMessage.includes('No se encontr') ||
        errorMessage.includes('not found')) {
      return {
        type: 'not-found',
        title: 'Recurso no encontrado',
        message: errorMessage,
        icon: '🔍'
      };
    }

    // Errores de red o conexión
    if (!error.response ||
        errorMessage.includes('red') ||
        errorMessage.includes('conexión') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('network') ||
        error.code === 'NETWORK_ERROR' ||
        error.code === 'ECONNREFUSED') {
      return {
        type: 'network',
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor. Verifique su conexión a internet e intente nuevamente.',
        icon: '🌐'
      };
    }

    // Errores del servidor (5xx)
    if (statusCode >= 500) {
      return {
        type: 'server',
        title: 'Error del servidor',
        message: 'Ocurrió un error interno en el servidor. Intente nuevamente más tarde.',
        icon: '🚨'
      };
    }

    // Error desconocido
    return {
      type: 'unknown',
      title: context ? `Error al ${context}` : 'Error inesperado',
      message: errorMessage,
      icon: '❌'
    };
  }

  /**
   * Formatea un mensaje de error para mostrar al usuario
   */
  static formatErrorMessage(error: any, context?: string): string {
    const errorInfo = this.categorizeError(error, context);
    return `${errorInfo.icon} ${errorInfo.title}: ${errorInfo.message}`;
  }

  /**
   * Devuelve sugerencias para resolver el error
   */
  static getErrorSuggestions(errorInfo: ErrorInfo): string[] {
    switch (errorInfo.type) {
      case 'conflict':
        return [
          'Verifique que no exista ya un registro con los mismos datos',
          'Intente usar un nombre o abreviatura diferentes',
          'Revise la lista de registros existentes antes de crear uno nuevo'
        ];
      
      case 'validation':
        return [
          'Revise que todos los campos requeridos estén completos',
          'Verifique el formato de los datos ingresados',
          'Consulte la documentación para conocer los formatos válidos'
        ];
      
      case 'permission':
        return [
          'Contacte al administrador del sistema para obtener los permisos necesarios',
          'Verifique que su sesión no haya expirado',
          'Asegúrese de pertenecer a una empresa válida'
        ];
      
      case 'not-found':
        return [
          'Verifique que el recurso no haya sido eliminado',
          'Actualice la página para obtener la información más reciente',
          'Contacte al administrador si el problema persiste'
        ];
      
      case 'network':
        return [
          'Verifique su conexión a internet',
          'Intente actualizar la página',
          'Contacte al administrador de sistemas si el problema persiste'
        ];
      
      case 'server':
        return [
          'Intente nuevamente en unos minutos',
          'Contacte al soporte técnico si el problema persiste',
          'Guarde su trabajo localmente mientras se soluciona el problema'
        ];
      
      default:
        return [
          'Intente actualizar la página',
          'Verifique que todos los datos sean correctos',
          'Contacte al soporte técnico si el problema persiste'
        ];
    }
  }
}