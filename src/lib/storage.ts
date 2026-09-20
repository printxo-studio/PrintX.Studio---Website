import fs from "fs";
import path from "path";

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

const ALLOWED_3D_EXTENSIONS = [".stl", ".obj", ".3mf", ".step", ".stp"];
const ALLOWED_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".pdf"];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export function validateUploadFile(filename: string, size: number): { valid: boolean; error?: string } {
  const ext = path.extname(filename).toLowerCase();
  const isAllowed = [...ALLOWED_3D_EXTENSIONS, ...ALLOWED_IMAGE_EXTENSIONS].includes(ext);

  if (!isAllowed) {
    return {
      valid: false,
      error: `Unsupported file type "${ext}". Allowed types: STL, OBJ, 3MF, STEP, PNG, JPG, PDF.`,
    };
  }

  if (size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 50MB limit (${(size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  return { valid: true };
}

export async function saveLocalFile(
  buffer: Buffer,
  originalFilename: string,
  folder = "uploads"
): Promise<UploadResult> {
  const uploadDir = path.join(process.cwd(), "public", folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(originalFilename);
  const cleanName = path.basename(originalFilename, ext).replace(/[^\w-]/g, "_");
  const uniqueFilename = `${cleanName}_${Date.now()}${ext}`;
  const filePath = path.join(uploadDir, uniqueFilename);

  await fs.promises.writeFile(filePath, buffer);

  return {
    url: `/${folder}/${uniqueFilename}`,
    filename: originalFilename,
    size: buffer.length,
    mimeType: ext.replace(".", ""),
  };
}
