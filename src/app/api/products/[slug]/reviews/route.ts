import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  reviewerName: z.string().min(2, "Name must be at least 2 characters").max(50),
  comment: z.string().min(4, "Feedback must be at least 4 characters").max(500),
  feedbackType: z.enum(["GENERAL", "DIMENSIONAL_ACCURACY", "SURFACE_FINISH", "MECHANICAL_STRENGTH"]).default("GENERAL"),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: slug }, { id: slug }],
      },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: "desc" },
    });

    const averageRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10
        : 5.0;

    return NextResponse.json({
      success: true,
      productId: product.id,
      count: reviews.length,
      averageRating,
      reviews,
    });
  } catch (error: any) {
    console.error("Reviews GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const validated = ReviewSchema.parse(body);

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: slug }, { id: slug }],
      },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const newReview = await prisma.review.create({
      data: {
        productId: product.id,
        rating: validated.rating,
        reviewerName: validated.reviewerName.trim(),
        comment: validated.comment.trim(),
        source: "WEBSITE",
        feedbackType: validated.feedbackType,
      },
    });

    // Calculate new aggregate
    const allReviews = await prisma.review.findMany({
      where: { productId: product.id },
      select: { rating: true },
    });

    const averageRating =
      Math.round(
        (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) * 10
      ) / 10;

    return NextResponse.json({
      success: true,
      review: newReview,
      count: allReviews.length,
      averageRating,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Review POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to post review" },
      { status: 500 }
    );
  }
}
