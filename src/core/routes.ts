export function taskDashboardUrl(taskId: string): string {
  return `https://videosays.com/dashboard/tasks/${encodeURIComponent(taskId)}`;
}
