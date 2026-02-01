import category from "@/models/category";
import connectToDatabase from "@/lib/dbConnect";
import { NextResponse } from "next/server";


export async function GET(req) {
    try {
        await connectToDatabase()
        const categoryData = await category.find({}).exec();


        return NextResponse.json({ message: categoryData }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "something went wrong" }, { status: 500 })
    }
}