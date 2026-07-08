import { Request, Response } from "express";
import { referenceRepository } from "../../data/repositories/reference.repository";

export async function listCategoriesHandler(_req: Request, res: Response) {
  try {
    const categories = await referenceRepository.findAllCategories();
    return res.status(200).json({ success: true, categories });
  } catch (err) {
    console.error("[GET /categories] failed to fetch categories:", err);
    return res.status(500).json({ success: false, error: "カテゴリの取得に失敗しました。" });
  }
}

export async function listPaymentMethodsHandler(_req: Request, res: Response) {
  try {
    const paymentMethods = await referenceRepository.findAllPaymentMethods();
    return res.status(200).json({ success: true, paymentMethods });
  } catch (err) {
    console.error("[GET /payment-methods] failed to fetch payment methods:", err);
    return res.status(500).json({ success: false, error: "支払い方法の取得に失敗しました。" });
  }
}

export async function listUsersHandler(_req: Request, res: Response) {
  try {
    const users = await referenceRepository.findAllUsers();
    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("[GET /users] failed to fetch users:", err);
    return res.status(500).json({ success: false, error: "ユーザーの取得に失敗しました。" });
  }
}
