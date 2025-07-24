import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { User } from './User';

export enum WorkflowStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  type!: string; // e.g. 'work_permit', 'letter', 'leave_request', ...

  @Column({ type: 'uuid' })
  createdBy!: string;

  @Column({ type: 'jsonb', nullable: true })
  data?: any; // اطلاعات فرم یا درخواست

  @Column({ type: 'enum', enum: WorkflowStatus, default: WorkflowStatus.PENDING })
  status: WorkflowStatus = WorkflowStatus.PENDING;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => TaskInstance, task => task.workflow)
  tasks?: TaskInstance[];
}

@Entity('task_instances')
export class TaskInstance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  workflowId!: string;

  @ManyToOne(() => Workflow, workflow => workflow.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowId' })
  workflow?: Workflow;

  @Column({ type: 'uuid' })
  assignedTo!: string; // userId

  @Column({ length: 100 })
  step!: string; // e.g. 'manager_approval', 'inspector_review', ...

  @Column({ type: 'enum', enum: WorkflowStatus, default: WorkflowStatus.PENDING })
  status: WorkflowStatus = WorkflowStatus.PENDING;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 