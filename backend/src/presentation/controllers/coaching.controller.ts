import { Request, Response } from "express";
import { coachingRequestSchema } from "../../application/dto/coaching.dto";
import { coachingService } from "../../application/services/coaching.service";

export async function getCoachingHandler(req: Request, res: Response) {
  const parsed = coachingRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const result = await coachingService.getCoachingAdvice(parsed.data);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[POST /coaching] failed to get coaching advice:", err);
    return res.status(500).json({
      success: false,
      error: "AIアドバイスの作成に失敗しました。",
    });
  }
}
