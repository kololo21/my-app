import { Router } from "express";
import { getCoachingHandler } from "../controllers/coaching.controller";

export const coachingRouter = Router();

// POST /coaching - AI貯金コーチング(節約アドバイス・収支予測)
coachingRouter.post("/", getCoachingHandler);
