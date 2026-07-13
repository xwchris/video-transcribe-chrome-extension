export interface ExportTranscriptSegment {
  start: number;
  end: number;
  text: string;
}

function padTimePart(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

function formatSubtitleTime(seconds: number): string {
  const totalMilliseconds = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(totalMilliseconds / 3600000);
  const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
  const wholeSeconds = Math.floor((totalMilliseconds % 60000) / 1000);
  const milliseconds = totalMilliseconds % 1000;
  return `${padTimePart(hours)}:${padTimePart(minutes)}:${padTimePart(wholeSeconds)},${padTimePart(milliseconds, 3)}`;
}

export function createSrt(segments: ExportTranscriptSegment[]): string {
  return segments.map((segment, index) => [
    String(index + 1),
    `${formatSubtitleTime(segment.start)} --> ${formatSubtitleTime(segment.end)}`,
    segment.text,
  ].join('\n')).join('\n\n');
}

export function safeExportFilename(value: string | null | undefined): string {
  return value
    ?.replace(/^https?:\/\//, '')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'transcript';
}
