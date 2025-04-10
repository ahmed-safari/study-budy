import { NextResponse } from "next/server";
import { prisma } from "@/utils/database";

export async function GET(request, { params }) {
  const { materialId } = await params;

  try {
    const material = await prisma.material.findUnique({
      where: {
        id: materialId,
      },
    });

    if (!material) {
      return NextResponse.json(
        { success: false, error: "Material not found" },
        { status: 404 }
      );
    }

    // Determine material status based on database state or processing state
    // This can be expanded later with actual processing status from another table
    let material_status = "Ready"; // Default to ready

    if (material.rawContent) {
      material_status = "Ready";
    } else if (material.link) {
      material_status = "Processing"; // Material is uploaded but not processed yet
    } else {
      material_status = "Not Found";
    }

    return NextResponse.json({
      success: true,
      material_id: material.id,
      material_status,
      title: material.title,
      fileName: material.fileName,
      type: material.type,
      link: material.link,
    });
  } catch (error) {
    console.error("Error fetching material status:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
