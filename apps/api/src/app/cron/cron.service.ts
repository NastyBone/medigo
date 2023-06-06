import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ResponseCiteDto } from '../repositories/cite/dto';

@WebSocketGateway()
@Injectable()
export class CronService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}
  @WebSocketServer() server: Server;

  setCronJob(cite: ResponseCiteDto): void {
    console.log('Cite!');

    const job = new CronJob(this.formatDate(cite.date, cite.time), () => {
      this.server.emit('alert', {
        data: cite,
      });
      console.log('Emitting: ' + cite.date);
    });
    this.schedulerRegistry.addCronJob('' + cite.id, job);
    job.start();
  }

  deleteCronJob(id: string): void {
    const job = this.schedulerRegistry.getCronJob('' + id);
    job.stop();
  }

  updateCronJob(cite: ResponseCiteDto): void {
    this.deleteCronJob('' + cite.id);
    this.setCronJob(cite);
  }

  deleteManyCronJobs(cites: ResponseCiteDto[]): void {
    cites.forEach((cite) => {
      this.deleteCronJob('' + cite.id);
    });
  }

  test(): void {
    console.log('Cite!');
    const myDate = this.formatDate('2023/05/20', '22:06'); //TODO: Check if this is the format
    const job = new CronJob(myDate, () => {
      if (this.server) {
        this.server.emit('alert', `Cita: ${myDate}`);
        console.log('Emitting test: ' + myDate);
      } else {
        console.log('Server error');
      }
    });
    this.schedulerRegistry.addCronJob('' + 'test', job);
    job.start();
  }

  formatDate(_date: string, _time: string): Date {
    let date = new Date(_date);
    date = new Date(new Date(date).getDate() - 1);
    const [hours, minutes] = _time.split(':');
    date.setHours(+hours);
    date.setMinutes(+minutes);

    console.log(date);

    return date;
  }
}
