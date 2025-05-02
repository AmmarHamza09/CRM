import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, company, location, type, status, priority, budget, client, endDate } = body;

    if (!title || !company) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const project = await prisma.project.update({
      where: {
        id: params.projectId,
        userId: session.user.id,
      },
      data: {
        title,
        description,
        company,
        location,
        type,
        status,
        priority,
        budget,
        client,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const project = await prisma.project.delete({
      where: {
        id: params.projectId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 