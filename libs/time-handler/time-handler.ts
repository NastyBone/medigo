import moment from 'moment';
//TODO: Testear fechas ahora csm
const dayParser = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miercoles',
  'Jueves',
  'Viernes',
  'Sabado',
  'Domingo',
];

export function timeStringToDate(
  date: string,
  time: string,
  yesterday: boolean = false
): Date {
  let fixedDate = new Date(
    moment(date + ' ' + time, 'DD/MM/YYYY hh:mm a')
      .add(5, 'seconds')
      .format('MM/DD/YYYY hh:mm a')
  );
  if (yesterday) {
    fixedDate = new Date(
      moment(date + ' ' + time, 'DD/MM/YYYY hh:mm a')
        .subtract(1, 'day')
        .add(5, 'seconds')
        .format('MM/DD/YYYY hh:mm a')
    );
  }
  return fixedDate;
}

export function checkTimeRange(start: string, end: string): boolean {
  return moment(end, 'hh:mm a') > moment(start, 'hh:mm a');
}

export function checkTimeConflict(
  start: string,
  end: string,
  day: string,
  doctorId: number,
  data: any,
  avalId: number | null = null
): boolean {
  let flag = true;
  data.map((aval: any) => {
    let id = null;
    if (aval.doctorId) id = aval.doctorId;
    else id = aval.doctor.id;
    if (doctorId == id) {
      if (day == aval.day) {
        if (
          moment(start, 'hh:mm a') >= moment(aval.start, 'hh:mm a') &&
          moment(start, 'hh:mm a') <= moment(aval.end, 'hh:mm a')
        ) {
          if (avalId !== aval.id) {
            flag = false;
          }
        }
        if (
          moment(end, 'hh:mm a') >= moment(aval.start, 'hh:mm a') &&
          moment(end, 'hh:mm a') <= moment(aval.end, 'hh:mm a')
        ) {

          if (avalId !== aval.id) {
            flag = false;
          }

        }
        if (
          moment(start, 'hh:mm a') >= moment(aval.start, 'hh:mm a') &&
          moment(end, 'hh:mm a') <= moment(aval.start, 'hh:mm a')
        ) {

          if (avalId !== aval.id) {
            flag = false;
          }
        }
        if (
          moment(start, 'hh:mm a') >= moment(aval.end, 'hh:mm a') &&
          moment(end, 'hh:mm a') <= moment(aval.end, 'hh:mm a')
        ) {

          if (avalId !== aval.id) {
            flag = false;
          }
        }
      }
    }
  });
  return flag;
}

export function formatDate(str: string | Date): string {
  str = new Date(str).toLocaleDateString('es-ES');
  return moment(str, 'DD/MM/YYYY hh:mm a').toDate().toLocaleDateString('es-ES');
}

export function dateFixFormat(date: string) {
  const [day, month, year] = date.split('/');
  return new Date(+year, +month - 1, +day, 0, 0, 0).toISOString();
}

export function getMonthRange(id: number): [Date, Date] {
  const now = moment(new Date()).month(id).date(31);
  const lastMonth = moment(now).subtract(1, 'month');

  return [now.toDate(), lastMonth.toDate()];
}

export function getDayOfTheWeekByDate(date: string): string {
  return dayParser[moment(date).isoWeekday()];
}

export function addDay(date: Date): Date {
  return moment(date).add(1, 'day').toDate();
}
export function validateDatesRange(start: string, end: string): {
  start: string;
  end: string;
} {
  if (
    start == (undefined || null || '') ||
    end == (undefined || null || '') ||
    new Date(start) > new Date(end)
  )
    throw new Error('Rango de fecha invalido');
  return { start, end };
}
