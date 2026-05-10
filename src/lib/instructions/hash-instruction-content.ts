import { createHash } from "node:crypto";

export function hashInstructionContent(content: string) {
  // 去除 BOM，统一行尾为 \n，确保跨平台哈希一致
  const normalized = content.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  return createHash("sha256").update(normalized, "utf8").digest("hex").slice(0, 16);
}
