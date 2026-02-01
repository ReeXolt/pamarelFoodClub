import { z } from 'zod';

export const reviewSubmissionSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  itemId: z.string().min(1, "Item ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().max(1000, "Comment cannot exceed 1000 characters").optional()
});