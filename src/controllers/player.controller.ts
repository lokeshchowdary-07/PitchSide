import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPlayerProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const existing = await prisma.player_profile.findUnique({ where: { user_id: userId } });
    if (existing) {
      return res.status(409).json({ message: "Player profile already exists." });
    }

    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const player = await prisma.player_profile.create({
      data: {
        user_id: userId,
        player_name: req.body.player_name ?? user.name,
        player_role: req.body.player_role,
        specialization: req.body.specialization,
        batting_style: req.body.batting_style,
        bowling_style: req.body.bowling_style,
      },
    });

    return res.status(201).json({ message: "Player profile created.", player });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getOwnPlayerProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const player = await prisma.player_profile.findUnique({ where: { user_id: userId } });
    if (!player) {
      return res.status(404).json({ message: "Player profile not found." });
    }
    return res.status(200).json({ player });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getPlayerById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const player = await prisma.player_profile.findUnique({ where: { player_id: id } });
    if (!player) {
      return res.status(404).json({ message: "Player not found." });
    }
    return res.status(200).json({ player });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const updateOwnPlayerProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const existing = await prisma.player_profile.findUnique({ where: { user_id: userId } });
    if (!existing) {
      return res.status(404).json({ message: "Player profile not found." });
    }
    const updated = await prisma.player_profile.update({
      where: { user_id: userId },
      data: req.body,
    });
    return res.status(200).json({ player: updated });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};