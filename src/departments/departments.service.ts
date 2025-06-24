import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentRepository.create(createDepartmentDto);
    return this.departmentRepository.save(department);
  }

  findAll(): Promise<Department[]> {
    return this.departmentRepository.find({
      relations: ['employees'],
    });
  }

  findOne(id: string): Promise<Department | null> {
    return this.departmentRepository.findOne({
      where: { id },
      relations: ['employees'],
    });
  }

  update(id: string, updateDepartmentDto: Partial<Department>): Promise<any> {
    return this.departmentRepository.update(id, updateDepartmentDto);
  }

  remove(id: string): Promise<any> {
    return this.departmentRepository.delete(id);
  }

  findByManager(managerId: string): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { managerId },
      relations: ['employees'],
    });
  }

  getDepartmentBudget(id: string): Promise<number> {
    return this.departmentRepository
      .createQueryBuilder('department')
      .select('department.budget', 'budget')
      .where('department.id = :id', { id })
      .getRawOne()
      .then(result => result?.budget || 0);
  }
} 