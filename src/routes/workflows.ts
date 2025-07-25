import { Router, Request, Response } from 'express';
import { database } from '../config/database';
import { Workflow, WorkflowStatus, TaskInstance } from '../models/Workflow';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// ایجاد گردش کار جدید
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { type, data, steps } = req.body; // steps: [{assignedTo, step}]
    const workflowRepo = database.getRepository(Workflow);
    const taskRepo = database.getRepository(TaskInstance);
    const workflow = workflowRepo.create({
      type,
      createdBy: req.user?.id,
      data,
      status: WorkflowStatus.PENDING,
    });
    const savedWorkflow = await workflowRepo.save(workflow);
    // ایجاد مراحل اولیه
    if (Array.isArray(steps)) {
      for (const s of steps) {
        const task = taskRepo.create({
          workflowId: savedWorkflow.id,
          assignedTo: s.assignedTo,
          step: s.step,
          status: WorkflowStatus.PENDING,
        });
        await taskRepo.save(task);
      }
    }
    res.status(201).json(savedWorkflow);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create workflow' });
  }
});

// لیست گردش کارها
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const workflows = await database.getRepository(Workflow).find({ order: { createdAt: 'DESC' } });
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch workflows' });
  }
});

// مشاهده جزئیات گردش کار و مراحل آن
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workflow = await database.getRepository(Workflow).findOne({ where: { id } });
    if (!workflow) return res.status(404).json({ message: 'Workflow not found' });
    const tasks = await database.getRepository(TaskInstance).find({ where: { workflowId: id }, order: { createdAt: 'ASC' } });
    res.json({ workflow, tasks });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch workflow details' });
  }
});

// افزودن مرحله جدید به گردش کار
router.post('/:id/tasks', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedTo, step } = req.body;
    const taskRepo = database.getRepository(TaskInstance);
    const task = taskRepo.create({
      workflowId: id,
      assignedTo,
      step,
      status: WorkflowStatus.PENDING,
    });
    const saved = await taskRepo.save(task);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add task' });
  }
});

// تغییر وضعیت و ثبت کامنت برای یک مرحله
router.put('/tasks/:taskId', authenticate, async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status, comment } = req.body;
    const taskRepo = database.getRepository(TaskInstance);
    const task = await taskRepo.findOne({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (status) task.status = status;
    if (comment) task.comment = comment;
    await taskRepo.save(task);
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task' });
  }
});

export default router; 