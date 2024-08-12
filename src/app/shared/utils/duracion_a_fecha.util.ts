export function convertirDuracionAFecha(duration: string): Date {
  const durationParts = duration.split(' ');
  let days = 0,
    time = '00:00:00';

  if (durationParts.length === 2) {
    days = parseInt(durationParts[0], 10);
    time = durationParts[1];
  } else if (durationParts.length === 1) {
    time = durationParts[0];
  }

  const timeParts = time.split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const seconds = parseInt(timeParts[2], 10);

  const fecha = new Date();
  fecha.setDate(fecha.getDate() + days);
  fecha.setHours(fecha.getHours() + hours);
  fecha.setMinutes(fecha.getMinutes() + minutes);
  fecha.setSeconds(fecha.getSeconds() + seconds);

  return fecha;
}
