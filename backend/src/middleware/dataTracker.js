/**
 * Middleware para rastrear cada passo do processamento de dados
 */

class DataTracker {
  constructor() {
    this.logs = [];
    this.currentUpload = null;
  }

  startUpload(filename) {
    this.currentUpload = {
      id: Date.now(),
      filename,
      startTime: new Date(),
      steps: [],
      status: 'iniciado'
    };
    this.log('UPLOAD_INICIADO', `Iniciando upload do arquivo: ${filename}`);
    return this.currentUpload.id;
  }

  log(step, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      step,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };

    console.log(`🔍 [DATA_TRACKER] ${step}: ${message}`);
    if (data) {
      console.log(`📊 [DATA_TRACKER] Dados:`, data);
    }

    this.logs.push(logEntry);
    
    if (this.currentUpload) {
      this.currentUpload.steps.push(logEntry);
    }
  }

  logError(step, error, data = null) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      step,
      message: `ERRO: ${error.message}`,
      error: error.stack,
      data: data ? JSON.stringify(data, null, 2) : null
    };

    console.error(`❌ [DATA_TRACKER] ${step}: ${error.message}`);
    console.error(`❌ [DATA_TRACKER] Stack:`, error.stack);
    if (data) {
      console.error(`📊 [DATA_TRACKER] Dados do erro:`, data);
    }

    this.logs.push(errorEntry);
    
    if (this.currentUpload) {
      this.currentUpload.steps.push(errorEntry);
      this.currentUpload.status = 'erro';
    }
  }

  finishUpload(status = 'concluido', summary = null) {
    if (this.currentUpload) {
      this.currentUpload.endTime = new Date();
      this.currentUpload.status = status;
      this.currentUpload.duration = this.currentUpload.endTime - this.currentUpload.startTime;
      
      if (summary) {
        this.currentUpload.summary = summary;
      }

      this.log('UPLOAD_FINALIZADO', `Upload finalizado com status: ${status}`, {
        duration: `${this.currentUpload.duration}ms`,
        totalSteps: this.currentUpload.steps.length,
        summary
      });
    }
  }

  getUploadReport() {
    return this.currentUpload;
  }

  getAllLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    this.currentUpload = null;
  }
}

// Instância singleton
const dataTracker = new DataTracker();

// Middleware para Express
const trackingMiddleware = (req, res, next) => {
  // Adicionar tracker ao request para uso nos controllers
  req.dataTracker = dataTracker;
  
  // Log da requisição
  if (req.path.includes('/upload') || req.path.includes('/ordens')) {
    dataTracker.log('REQUEST_RECEIVED', `${req.method} ${req.path}`, {
      headers: req.headers,
      query: req.query,
      body: req.body ? 'Dados presentes' : 'Sem dados'
    });
  }
  
  next();
};

module.exports = {
  DataTracker,
  dataTracker,
  trackingMiddleware
};

