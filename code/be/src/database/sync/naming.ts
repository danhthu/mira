// Chỗ DUY NHẤT ánh xạ tên cột Postgres (snake_case) sang tên trường API (camelCase).
// Registry khai cột theo tên thật trong 001_initial.sql; tên API suy ra từ đây,
// nên không có cách nào hai bên lệch nhau.
export function toCamelCase(snake: string): string {
  return snake.replace(/_([a-z0-9])/g, (_match, char: string) => char.toUpperCase());
}
