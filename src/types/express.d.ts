declare namespace Express {
  export interface Request {
    user?: import('@/models/User').User;
    integration?: import('@/models/IntegrationConfig').IntegrationConfig;
    session?: any;
  }
}
