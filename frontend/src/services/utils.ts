/**
 * Checks if the element (EventTarget) that received a keyboard typing event is an input element
 * that may want to handle it.
 *
 * @param target Element that received the event.
 * @returns True if the element is an input element that can be typed to, otherwise false.
 */
function isTargetTyping(target: EventTarget | null) {
  const localTarget = target as HTMLInputElement;

  if (!localTarget) {
    return false;
  }

  if (
    (localTarget.tagName === "INPUT" && localTarget.type !== "file") ||
    localTarget.tagName === "TEXTAREA" ||
    localTarget.isContentEditable
  ) {
    return true;
  }

  return false;
}

/**
 * Sanitizes a file name by removing illegal and hidden control characters,
 * leading and trailing spaces and trimming long file names.
 *
 * @param fileName Name of the file.
 * @returns Sanitized name of the file.
 */
function sanitizeFilename(fileName: string) {
  return fileName
    .replace(/[\/\?<>\\:\*\|"]/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim()
    .substring(0, 255);
}

export { isTargetTyping, sanitizeFilename };
