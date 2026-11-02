// src/app/api/study-kit/route.ts
// Alias handler untuk POST /api/study-kit (PRD Section 5.2)
export { POST } from "../generate-kit/route";

// Segment config harus dideklarasikan langsung di file route ini (tidak ikut ter-re-export).
export const maxDuration = 180;
