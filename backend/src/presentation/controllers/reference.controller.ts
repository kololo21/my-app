import { Request, Response } from "express";
import { referenceRepository } from "../../data/repositories/reference.repository";

export async function listCategoriesHandler(_req: Request, res: Response) {
  const categories = await referenceRepository.findAllCategories();
  return res.status(200).json({ success: true, categories });
}

export async function listPaymentMethodsHandler(_req: Request, res: Response) {
  const paymentMethods = await referenceRepository.findAllPaymentMethods();
  return res.status(200).json({ success: true, paymentMethods });
}

export async function listUsersHandler(_req: Request, res: Response) {
  const users = await referenceRepository.findAllUsers();
  return res.status(200).json({ success: true, users });
}
