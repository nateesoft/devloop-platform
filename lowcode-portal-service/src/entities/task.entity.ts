import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { MyProject } from './my-project.entity';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['todo', 'in_progress', 'review', 'completed'],
    default: 'todo'
  })
  status: TaskStatus;

  @Column({
    type: 'enum', 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  })
  priority: TaskPriority;

  @Column({ type: 'int', default: 0, comment: 'Progress percentage 0-100' })
  progress: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, comment: 'Estimated hours to complete' })
  estimatedHours?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, comment: 'Actual hours spent' })
  actualHours?: number;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assignee?: string;

  @Column({ type: 'json', nullable: true, comment: 'Task labels/tags' })
  tags?: string[];

  @Column({ type: 'json', nullable: true, comment: 'Additional task metadata' })
  metadata?: Record<string, any>;

  @Column({ name: 'project_id', nullable: true })
  projectId?: number;

  @ManyToOne(() => MyProject, project => project.id, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project?: MyProject;

  @Column({ name: 'created_by' })
  createdBy: number;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo?: number;

  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedUser?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties for UI
  get isOverdue(): boolean {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate && this.status !== 'completed';
  }

  get isDueSoon(): boolean {
    if (!this.dueDate) return false;
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return this.dueDate <= threeDaysFromNow && this.status !== 'completed';
  }
}