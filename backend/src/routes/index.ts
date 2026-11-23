import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';

import * as authCtrl from '../controllers/authController';
import * as dashCtrl from '../controllers/dashboardController';
import * as contactCtrl from '../controllers/contactController';
import * as templateCtrl from '../controllers/templateController';
import * as scheduleCtrl from '../controllers/scheduleController';
import * as aiCtrl from '../controllers/aiController';
import * as autoCtrl from '../controllers/automationController';
import * as logCtrl from '../controllers/activityLogController';
import * as settingCtrl from '../controllers/settingController';
import * as integCtrl from '../controllers/integrationController';

const router = Router();

// --- Auth Routes ---
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', authenticateJWT, authCtrl.getMe);
router.put('/auth/profile', authenticateJWT, authCtrl.updateProfile);
router.put('/auth/change-password', authenticateJWT, authCtrl.changePassword);

// --- Dashboard Routes ---
router.get('/dashboard/stats', authenticateJWT, dashCtrl.getDashboardStats);

// --- Contact Routes ---
router.get('/contacts', authenticateJWT, contactCtrl.getContacts);
router.get('/contacts/:id', authenticateJWT, contactCtrl.getContactById);
router.post('/contacts', authenticateJWT, contactCtrl.createContact);
router.put('/contacts/:id', authenticateJWT, contactCtrl.updateContact);
router.delete('/contacts/:id', authenticateJWT, contactCtrl.deleteContact);
router.patch('/contacts/:id/favorite', authenticateJWT, contactCtrl.toggleFavoriteContact);

// --- Template Routes ---
router.get('/templates', authenticateJWT, templateCtrl.getTemplates);
router.post('/templates', authenticateJWT, templateCtrl.createTemplate);
router.put('/templates/:id', authenticateJWT, templateCtrl.updateTemplate);
router.delete('/templates/:id', authenticateJWT, templateCtrl.deleteTemplate);
router.post('/templates/:id/duplicate', authenticateJWT, templateCtrl.duplicateTemplate);
router.post('/templates/:id/use', authenticateJWT, templateCtrl.useTemplate);

// --- Schedule Routes ---
router.get('/schedules', authenticateJWT, scheduleCtrl.getSchedules);
router.post('/schedules', authenticateJWT, scheduleCtrl.createSchedule);
router.put('/schedules/:id', authenticateJWT, scheduleCtrl.updateSchedule);
router.delete('/schedules/:id', authenticateJWT, scheduleCtrl.deleteSchedule);
router.post('/schedules/:id/postpone', authenticateJWT, scheduleCtrl.postponeSchedule);
router.post('/schedules/:id/confirm-manual-sent', authenticateJWT, scheduleCtrl.confirmManualSent);

// --- AI Routes ---
router.post('/ai/generate', authenticateJWT, aiCtrl.generateMessage);
router.post('/ai/analyze', authenticateJWT, aiCtrl.analyzeConversation);
router.get('/ai/drafts', authenticateJWT, aiCtrl.getDrafts);

// --- Automation Routes ---
router.get('/automation/rules', authenticateJWT, autoCtrl.getRules);
router.post('/automation/rules', authenticateJWT, autoCtrl.createRule);
router.put('/automation/rules/:id', authenticateJWT, autoCtrl.updateRule);
router.delete('/automation/rules/:id', authenticateJWT, autoCtrl.deleteRule);
router.post('/automation/test', authenticateJWT, autoCtrl.testRule);

// --- Activity Log Routes ---
router.get('/logs', authenticateJWT, logCtrl.getActivityLogs);
router.post('/logs', authenticateJWT, logCtrl.createLog);
router.delete('/logs/clear', authenticateJWT, logCtrl.clearLogs);

// --- Settings & Backup Routes ---
router.get('/settings', authenticateJWT, settingCtrl.getSettings);
router.put('/settings/ai', authenticateJWT, settingCtrl.updateAISetting);
router.put('/settings/preferences', authenticateJWT, settingCtrl.updateUserPreferences);
router.get('/settings/export', authenticateJWT, settingCtrl.exportUserData);

// --- Integration Routes (Meta) ---
router.get('/integrations/status', authenticateJWT, integCtrl.getIntegrationStatus);
router.put('/integrations/meta', authenticateJWT, integCtrl.updateIntegration);
router.get('/integrations/webhook', integCtrl.verifyMetaWebhook);
router.post('/integrations/webhook', integCtrl.handleMetaWebhookEvents);

export default router;
