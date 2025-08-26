import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from '../../entities/task.entity';
import { User } from '../../entities/user.entity';
import { MyProject } from '../../entities/my-project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User, MyProject]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}