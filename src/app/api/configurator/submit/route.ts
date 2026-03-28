import { NextResponse } from "next/server";
import { storeSubmission } from "@/features/configurator/storage";
import { validateAll } from "@/features/configurator/validation";
import { type FormValues } from "@/features/configurator/model";

type Payload = {
  values?: FormValues;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const rawPayload = formData.get("payload");

    if (typeof rawPayload !== "string") {
      return NextResponse.json({ message: "Die Anfrage enthaelt keine gueltigen Daten." }, { status: 400 });
    }

    const payload = JSON.parse(rawPayload) as Payload;
    const values = payload.values;

    if (!values) {
      return NextResponse.json({ message: "Die Anfrage enthaelt keine Formulardaten." }, { status: 400 });
    }

    const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
    const errors = validateAll(values, files);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          message: "Bitte pruefen Sie die markierten Angaben.",
          errors,
        },
        { status: 400 },
      );
    }

    const result = await storeSubmission(values, files);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Die Anfrage konnte nicht verarbeitet werden.",
      },
      { status: 500 },
    );
  }
}
