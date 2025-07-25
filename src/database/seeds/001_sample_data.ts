import { DataSource } from 'typeorm';
import { IntegrationConfig } from '../../models/IntegrationConfig';
import { AuditLog } from '../../models/AuditLog';
import { ExternalMapping } from '../../models/ExternalMapping';
import { SyncLog } from '../../models/SyncLog';
import { User, UserRole } from '../../models/User';
import { Tenant } from '../../models/Tenant';
import { Mall } from '../../models/Mall';

export class SampleData1700000000002 {
  public async up(dataSource: DataSource): Promise<void> {
    const userRepo = dataSource.getRepository(User);
    const tenantRepo = dataSource.getRepository(Tenant);
    const mallRepo = dataSource.getRepository(Mall);
    const integrationRepo = dataSource.getRepository(IntegrationConfig);
    const mappingRepo = dataSource.getRepository(ExternalMapping);
    const syncRepo = dataSource.getRepository(SyncLog);
    const auditRepo = dataSource.getRepository(AuditLog);

    const mall1 = await mallRepo.findOne({ where: { mallCode: 'MALL-001' } });
    const tenant1 = await tenantRepo.findOne({ where: { tenantCode: 'TNT-001' } });

    // --- Users ---
    const superAdmin = userRepo.create({ username: 'superadmin', role: UserRole.SUPER_ADMIN });
    const mallAdmin = userRepo.create({ username: 'malladmin', role: UserRole.MALL_ADMIN, mall: mall1 });
    const tenantAdmin = userRepo.create({ username: 'tenantadmin', role: UserRole.TENANT_ADMIN, tenant: tenant1 });
    const readOnly = userRepo.create({ username: 'readonly', role: UserRole.TENANT_USER, tenant: tenant1 });
    await userRepo.save([superAdmin, mallAdmin, tenantAdmin, readOnly]);

    // --- Integrations ---
    const sap = integrationRepo.create({ name: 'SAP ERP', type: 'SAP', mall: mall1, status: 'connected', credentials: { apiKey: 'sap_key' } });
    const salesforce = integrationRepo.create({ name: 'Salesforce CRM', type: 'Salesforce', mall: mall1, status: 'connected', credentials: { clientId: 'sf_id', clientSecret: 'sf_secret' } });
    const dynamics = integrationRepo.create({ name: 'Dynamics365', type: 'Dynamics365', mall: mall1, status: 'disconnected', credentials: { endpoint: 'https://dynamics.example.com/api' } });
    const oracle = integrationRepo.create({ name: 'Oracle Financial', type: 'Oracle', mall: mall1, status: 'connected', credentials: { user: 'oracle_user', password: 'oracle_pass', endpoint: 'https://oracle.example.com/api' } });
    await integrationRepo.save([sap, salesforce, dynamics, oracle]);

    // --- External Mappings ---
    await mappingRepo.save([
      mappingRepo.create({ integrationConfig: sap, mallField: 'invoiceId', externalField: 'SAP_INVOICE_ID' }),
      mappingRepo.create({ integrationConfig: salesforce, mallField: 'customerId', externalField: 'SF_CUSTOMER_ID' }),
    ]);

    // --- Sync Logs ---
    await syncRepo.save([
      syncRepo.create({ integrationConfig: sap, operation: 'sync', status: 'success', details: 'Initial sync', startedAt: new Date(), finishedAt: new Date() }),
      syncRepo.create({ integrationConfig: salesforce, operation: 'sync', status: 'failed', details: 'API error', startedAt: new Date(), finishedAt: new Date() }),
    ]);

    // --- Audit Logs ---
    await auditRepo.save([
      auditRepo.create({ userId: superAdmin.id, userRole: UserRole.SUPER_ADMIN, action: 'create', resource: 'integration', resourceId: sap.id, resourceType: 'integration', endpoint: '/api/integrations', method: 'POST', success: true, timestamp: new Date() }),
      auditRepo.create({ userId: mallAdmin.id, userRole: UserRole.MALL_ADMIN, action: 'sync', resource: 'integration', resourceId: salesforce.id, resourceType: 'integration', endpoint: '/api/integrations/sync', method: 'POST', success: false, errorMessage: 'API error', timestamp: new Date() }),
    ]);

    // --- Security Events (as audit logs) ---
    await auditRepo.save([
      auditRepo.create({ userId: readOnly.id, userRole: UserRole.TENANT_USER, action: 'unauthorized-access', resource: 'integration', resourceId: sap.id, resourceType: 'integration', endpoint: '/api/integrations', method: 'DELETE', success: false, errorMessage: 'Forbidden', timestamp: new Date() }),
    ]);

    console.log('✅ Sample data seeded successfully');
  }

  public async down(dataSource: DataSource): Promise<void> {
    // Implement down migration if needed
  }
} 